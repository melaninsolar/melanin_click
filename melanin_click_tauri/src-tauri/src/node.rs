use crate::core::{ensure_directory_exists, get_process_manager};
use crate::{AppError, AppState, NodeStatus};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::State;

#[tauri::command]
pub async fn download_and_install_bitcoin(state: State<'_, AppState>) -> Result<String, AppError> {
    let url = get_bitcoin_download_url().await?;
    let home_dir = dirs::home_dir()
        .ok_or_else(|| AppError::Node("Could not find home directory".to_string()))?;
    let install_path = home_dir.join("bitcoin-core");
    let filename = url.split('/').next_back().unwrap_or("bitcoin.tar.gz");
    let downloaded_file = install_path.join(filename);

    ensure_directory_exists(&install_path).await?;

    // Download the file
    download_file_internal(&url, &downloaded_file, &state).await?;

    // Extract based on file type
    if filename.ends_with(".tar.gz") {
        extract_tarball(&downloaded_file, &install_path).await?;
        fs::remove_file(&downloaded_file)?;
    } else if filename.ends_with(".zip") {
        extract_zip(&downloaded_file, &install_path).await?;
        fs::remove_file(&downloaded_file)?;
    }

    // Set executable permissions on Unix-like systems
    crate::core::set_executable_permissions(&install_path).await?;

    // Create Bitcoin configuration directories
    create_bitcoin_config_dirs().await?;

    Ok(
        "Bitcoin Core installed successfully. Both bitcoind and bitcoin-qt are available."
            .to_string(),
    )
}

#[tauri::command]
pub async fn download_and_install_whive(state: State<'_, AppState>) -> Result<String, AppError> {
    let url = get_whive_download_url().await?;
    let home_dir = dirs::home_dir()
        .ok_or_else(|| AppError::Node("Could not find home directory".to_string()))?;
    let install_path = home_dir.join("whive-core");
    let filename = url.split('/').next_back().unwrap_or("whive.tar.gz");
    let downloaded_file = install_path.join(filename);

    ensure_directory_exists(&install_path).await?;

    // Download the file
    download_file_internal(&url, &downloaded_file, &state).await?;

    // Extract based on file type
    if filename.ends_with(".tar.gz") {
        extract_tarball(&downloaded_file, &install_path).await?;
        fs::remove_file(&downloaded_file)?;
    } else if filename.ends_with(".zip") {
        extract_zip(&downloaded_file, &install_path).await?;
        fs::remove_file(&downloaded_file)?;
    }

    // Set executable permissions
    crate::core::set_executable_permissions(&install_path).await?;

    Ok(
        "Whive Core installed successfully. Includes whived, whive-qt, and minerd for mining."
            .to_string(),
    )
}

#[tauri::command]
pub async fn run_bitcoin_mainnet(use_qt: Option<bool>) -> Result<String, AppError> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| AppError::Node("Could not find home directory".to_string()))?;

    // Default to daemon mode (bitcoind) for better monitoring
    let prefer_qt = use_qt.unwrap_or(false);
    let bitcoin_path = find_bitcoin_executable(&home_dir, prefer_qt)?;

    let mainnet_conf_dir = home_dir.join(".bitcoin");
    let conf_path = mainnet_conf_dir.join("bitcoin.conf");

    if !conf_path.exists() {
        ensure_directory_exists(&mainnet_conf_dir).await?;
        create_bitcoin_conf(&conf_path, false).await?;
    }

    let process_manager = get_process_manager();
    let conf_arg = format!("-conf={}", conf_path.display());
    let mut args = vec![conf_arg.as_str()];

    // Add daemon flag if using bitcoind
    if !prefer_qt {
        args.push("-daemon");
    }

    let pid = process_manager
        .start_process("bitcoin_mainnet", &bitcoin_path, &args, None)
        .await?;

    let executable_name = if prefer_qt { "bitcoin-qt" } else { "bitcoind" };
    Ok(format!(
        "Started Bitcoin mainnet node ({}) with PID: {}",
        executable_name, pid
    ))
}

#[tauri::command]
pub async fn run_bitcoin_pruned(use_qt: Option<bool>) -> Result<String, AppError> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| AppError::Node("Could not find home directory".to_string()))?;

    let prefer_qt = use_qt.unwrap_or(false);
    let bitcoin_path = find_bitcoin_executable(&home_dir, prefer_qt)?;

    let pruned_conf_dir = home_dir.join(".bitcoin");
    let conf_path = pruned_conf_dir.join("bitcoin.conf");

    if !conf_path.exists() {
        ensure_directory_exists(&pruned_conf_dir).await?;
        create_bitcoin_conf(&conf_path, true).await?;
    }

    let process_manager = get_process_manager();
    let conf_arg = format!("-conf={}", conf_path.display());
    let mut args = vec![conf_arg.as_str(), "-prune=550"];

    // Add daemon flag if using bitcoind
    if !prefer_qt {
        args.push("-daemon");
    }

    let pid = process_manager
        .start_process("bitcoin_pruned", &bitcoin_path, &args, None)
        .await?;

    let executable_name = if prefer_qt { "bitcoin-qt" } else { "bitcoind" };
    Ok(format!(
        "Started Bitcoin pruned node ({}) with PID: {}",
        executable_name, pid
    ))
}

#[tauri::command]
pub async fn run_whive_node(use_qt: Option<bool>) -> Result<String, AppError> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| AppError::Node("Could not find home directory".to_string()))?;

    let prefer_qt = use_qt.unwrap_or(false);
    let whive_path = find_whive_executable(&home_dir, prefer_qt)?;

    let process_manager = get_process_manager();
    let mut args = vec![];

    // Add daemon flag if using whived
    if !prefer_qt {
        args.push("-daemon");
    }

    let pid = process_manager
        .start_process("whive_node", &whive_path, &args, None)
        .await?;

    let executable_name = if prefer_qt { "whive-qt" } else { "whived" };
    Ok(format!(
        "Started Whive node ({}) with PID: {}",
        executable_name, pid
    ))
}

#[tauri::command]
pub async fn stop_node(node_type: String) -> Result<String, AppError> {
    let process_manager = get_process_manager();
    process_manager.stop_process(&node_type).await?;
    Ok(format!("{} node stopped successfully", node_type))
}

#[tauri::command]
pub async fn get_node_status(node_type: String) -> Result<NodeStatus, AppError> {
    let process_manager = get_process_manager();
    let is_running = process_manager.is_process_running(&node_type).await;

    // Try to get actual status via RPC if available
    let (sync_progress, block_height, peer_count) = if is_running {
        get_node_rpc_status(&node_type).await.unwrap_or((0.0, 0, 0))
    } else {
        (0.0, 0, 0)
    };

    Ok(NodeStatus {
        is_running,
        sync_progress,
        block_height,
        peer_count,
        network: "mainnet".to_string(),
        data_dir: format!(
            "~/.{}",
            if node_type.contains("bitcoin") {
                "bitcoin"
            } else {
                "whive"
            }
        ),
        config_path: format!(
            "~/.{}/{}.conf",
            if node_type.contains("bitcoin") {
                "bitcoin"
            } else {
                "whive"
            },
            if node_type.contains("bitcoin") {
                "bitcoin"
            } else {
                "whive"
            }
        ),
    })
}

// Helper functions
async fn get_bitcoin_download_url() -> Result<String, AppError> {
    let os_type = std::env::consts::OS;
    let arch = std::env::consts::ARCH;
    let version = "28.0"; // Using stable version

    let url = match (os_type, arch) {
        ("macos", "aarch64") => format!(
            "https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-arm64-apple-darwin.tar.gz",
            version, version
        ),
        ("macos", _) => format!(
            "https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-x86_64-apple-darwin.tar.gz",
            version, version
        ),
        ("linux", "aarch64") => format!(
            "https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-aarch64-linux-gnu.tar.gz",
            version, version
        ),
        ("linux", _) => format!(
            "https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-x86_64-linux-gnu.tar.gz",
            version, version
        ),
        ("windows", _) => format!(
            "https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-win64.zip",
            version, version
        ),
        _ => format!(
            "https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-x86_64-apple-darwin.tar.gz",
            version, version
        ),
    };

    Ok(url)
}

async fn get_whive_download_url() -> Result<String, AppError> {
    let os_type = std::env::consts::OS;
    let arch = std::env::consts::ARCH;
    let version = "22.2.2";

    let url = match (os_type, arch) {
        ("macos", "aarch64") => format!("https://github.com/whiveio/whive/releases/download/{}/whive-ventura-{}-arm64.tar.gz", version, version),
        ("macos", _) => format!("https://github.com/whiveio/whive/releases/download/{}/whive-ventura-{}-osx64.tar.gz", version, version),
        ("linux", _) => format!("https://github.com/whiveio/whive/releases/download/{}/whive-{}-x86_64-linux-gnu.tar.gz", version, version),
        ("windows", _) => format!("https://github.com/whiveio/whive/releases/download/{}/whive-{}-win64.zip", version, version),
        _ => format!("https://github.com/whiveio/whive/releases/download/{}/whive-ventura-{}-osx64.tar.gz", version, version),
    };

    Ok(url)
}

async fn download_file_internal(
    url: &str,
    destination: &Path,
    state: &State<'_, AppState>,
) -> Result<(), AppError> {
    let client = reqwest::Client::new();
    let response = client
        .get(url)
        .send()
        .await
        .map_err(|e| AppError::Node(format!("Failed to download: {}", e)))?;

    if !response.status().is_success() {
        return Err(AppError::Node(format!(
            "Failed to download: HTTP {}",
            response.status()
        )));
    }

    let total_size = response.content_length().unwrap_or(0);

    let mut file = std::fs::File::create(destination)?;
    let start_time = std::time::Instant::now();

    // Use bytes() for reqwest 0.12
    let bytes = response
        .bytes()
        .await
        .map_err(|e| AppError::Node(format!("Download error: {}", e)))?;

    std::io::Write::write_all(&mut file, &bytes)?;

    let downloaded = bytes.len() as u64;
    let elapsed = start_time.elapsed().as_secs_f64();
    let speed = if elapsed > 0.0 {
        downloaded as f64 / elapsed
    } else {
        0.0
    };

    // Update progress
    let progress = crate::DownloadProgress {
        total_size,
        downloaded,
        speed,
        status: "completed".to_string(),
        url: url.to_string(),
        started_at: chrono::Utc::now(),
    };

    state
        .downloads
        .lock()
        .await
        .insert(url.to_string(), progress);

    Ok(())
}

async fn extract_tarball(archive_path: &Path, extract_to: &Path) -> Result<(), AppError> {
    let file = std::fs::File::open(archive_path)?;
    let tar = flate2::read::GzDecoder::new(file);
    let mut archive = tar::Archive::new(tar);
    archive
        .unpack(extract_to)
        .map_err(|e| AppError::Node(format!("Failed to extract: {}", e)))?;
    Ok(())
}

async fn extract_zip(archive_path: &Path, extract_to: &Path) -> Result<(), AppError> {
    let file = std::fs::File::open(archive_path)?;
    let mut archive = zip::ZipArchive::new(file)
        .map_err(|e| AppError::Node(format!("Failed to open zip: {}", e)))?;

    for i in 0..archive.len() {
        let mut file = archive
            .by_index(i)
            .map_err(|e| AppError::Node(format!("Failed to read zip entry: {}", e)))?;
        let outpath = match file.enclosed_name() {
            Some(path) => extract_to.join(path),
            None => continue,
        };

        if file.name().ends_with('/') {
            std::fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    std::fs::create_dir_all(p)?;
                }
            }
            let mut outfile = std::fs::File::create(&outpath)?;
            std::io::copy(&mut file, &mut outfile)?;
        }

        // Set permissions on Unix
        #[cfg(unix)]
        {
            use std::os::unix::fs::PermissionsExt;
            if let Some(mode) = file.unix_mode() {
                std::fs::set_permissions(&outpath, std::fs::Permissions::from_mode(mode))?;
            }
        }
    }
    Ok(())
}

async fn create_bitcoin_config_dirs() -> Result<(), AppError> {
    let home_dir = dirs::home_dir()
        .ok_or_else(|| AppError::Node("Could not find home directory".to_string()))?;
    let bitcoin_dir = home_dir.join(".bitcoin");

    ensure_directory_exists(&bitcoin_dir).await?;

    // Create bitcoin.conf file
    let conf_path = bitcoin_dir.join("bitcoin.conf");
    if !conf_path.exists() {
        create_bitcoin_conf(&conf_path, false).await?;
    }

    Ok(())
}

async fn create_bitcoin_conf(conf_path: &Path, prune: bool) -> Result<(), AppError> {
    let mut conf_content = vec![
        "# Bitcoin Core Configuration".to_string(),
        "# Generated by Melanin Click".to_string(),
        "".to_string(),
        "# RPC Settings".to_string(),
        "server=1".to_string(),
        "rpcuser=melanin".to_string(),
        format!(
            "rpcpassword={}",
            std::env::var("BITCOIN_RPC_PASSWORD")
                .expect("BITCOIN_RPC_PASSWORD environment variable must be set for security")
        ),
        "rpcport=8332".to_string(),
        "rpcbind=127.0.0.1".to_string(),
        "rpcallowip=127.0.0.1".to_string(),
        "".to_string(),
        "# Network Settings".to_string(),
        "listen=1".to_string(),
        "maxconnections=16".to_string(),
        "".to_string(),
    ];

    if prune {
        conf_content.push("# Pruned Node Configuration".to_string());
        conf_content.push("prune=550".to_string());
    } else {
        conf_content.push("# Full Node Configuration".to_string());
        conf_content.push("txindex=1".to_string());
    }

    conf_content.push("".to_string());

    // OS-specific optimizations
    match std::env::consts::OS {
        "linux" => {
            conf_content.push("# Linux Optimizations".to_string());
            conf_content.push("dbcache=450".to_string());
        }
        "macos" => {
            conf_content.push("# macOS Optimizations".to_string());
            conf_content.push("dbcache=800".to_string());
        }
        "windows" => {
            conf_content.push("# Windows Optimizations".to_string());
            conf_content.push("dbcache=600".to_string());
        }
        _ => {}
    }

    // Architecture-specific optimizations
    match std::env::consts::ARCH {
        "aarch64" => {
            conf_content.push("par=4".to_string());
        }
        _ => {
            conf_content.push("par=8".to_string());
        }
    }

    std::fs::write(conf_path, conf_content.join("\n"))?;
    Ok(())
}

fn find_bitcoin_executable(home_dir: &Path, prefer_qt: bool) -> Result<PathBuf, AppError> {
    let base_path = home_dir.join("bitcoin-core");

    // Try to find the preferred executable first
    if prefer_qt {
        if let Ok(path) = find_executable_in_path_sync(&base_path, "bitcoin-qt") {
            return Ok(path);
        }
        // Fallback to bitcoind
        find_executable_in_path_sync(&base_path, "bitcoind")
    } else {
        if let Ok(path) = find_executable_in_path_sync(&base_path, "bitcoind") {
            return Ok(path);
        }
        // Fallback to bitcoin-qt
        find_executable_in_path_sync(&base_path, "bitcoin-qt")
    }
}

fn find_whive_executable(home_dir: &Path, prefer_qt: bool) -> Result<PathBuf, AppError> {
    let base_path = home_dir.join("whive-core");

    // Try to find the preferred executable first
    if prefer_qt {
        if let Ok(path) = find_executable_in_path_sync(&base_path, "whive-qt") {
            return Ok(path);
        }
        // Fallback to whived
        find_executable_in_path_sync(&base_path, "whived")
    } else {
        if let Ok(path) = find_executable_in_path_sync(&base_path, "whived") {
            return Ok(path);
        }
        // Fallback to whive-qt
        find_executable_in_path_sync(&base_path, "whive-qt")
    }
}

fn find_executable_in_path_sync(
    base_path: &Path,
    executable_name: &str,
) -> Result<PathBuf, AppError> {
    fn search_recursive(dir: &Path, target: &str) -> Option<PathBuf> {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(found) = search_recursive(&path, target) {
                        return Some(found);
                    }
                } else if path
                    .file_name()
                    .and_then(|name| name.to_str())
                    .map(|name| {
                        name == target
                            || name == format!("{}.exe", target)
                            || name.starts_with(target)
                    })
                    .unwrap_or(false)
                {
                    return Some(path);
                }
            }
        }
        None
    }

    search_recursive(base_path, executable_name).ok_or_else(|| {
        AppError::Node(format!(
            "{} executable not found in {}",
            executable_name,
            base_path.display()
        ))
    })
}

async fn get_node_rpc_status(node_type: &str) -> Result<(f64, u64, u32), AppError> {
    // This would implement RPC calls to get actual node status
    // For now, return mock data but this should be implemented
    if node_type.contains("bitcoin") {
        // TODO: Implement Bitcoin RPC calls
        Ok((95.5, 850000, 8))
    } else {
        // TODO: Implement Whive RPC calls
        Ok((88.2, 425000, 6))
    }
}
