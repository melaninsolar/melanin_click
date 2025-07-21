// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::collections::HashMap;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::fs;
use std::io::Write;
use serde::{Deserialize, Serialize};
use tauri::State;
use tokio::sync::Mutex;
use sysinfo::{System, Disks};

// Application state
#[derive(Default)]
pub struct AppState {
    pub downloads: Mutex<HashMap<String, DownloadProgress>>,
    pub processes: Mutex<HashMap<String, u32>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub total_size: u64,
    pub downloaded: u64,
    pub speed: f64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub total_memory: u64,
    pub available_memory: u64,
    pub disk_space: u64,
    pub available_disk_space: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CryptoConfig {
    pub bitcoin_version: String,
    pub whive_version: String,
    pub bitcoin_data_dir: String,
    pub whive_data_dir: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MiningPool {
    pub name: String,
    pub url: String,
    pub port: u16,
    pub fee: f64,
    pub location: String,
    pub algorithm: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HardwareInfo {
    pub cpu_cores: usize,
    pub cpu_threads: usize,
    pub cpu_brand: String,
    pub cpu_frequency: u64,
    pub gpu_devices: Vec<GpuDevice>,
    pub total_memory: u64,
    pub available_memory: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuDevice {
    pub name: String,
    pub vendor: String,
    pub memory: u64,
    pub compute_capability: String,
    pub driver_version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MiningConfig {
    pub pool_url: String,
    pub pool_port: u16,
    pub wallet_address: String,
    pub worker_name: String,
    pub mining_intensity: u8,
    pub hardware_selection: Vec<String>,
    pub algorithm: String,
    pub auto_start: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MiningStats {
    pub hashrate: f64,
    pub accepted_shares: u64,
    pub rejected_shares: u64,
    pub uptime: u64,
    pub temperature: f64,
    pub power_consumption: f64,
    pub estimated_earnings: f64,
}

// Tauri commands
#[tauri::command]
async fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let platform = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();
    
    let total_memory = sys.total_memory();
    let available_memory = sys.available_memory();
    
    // Get disk space for home directory
    let home_dir = dirs::home_dir().unwrap_or_else(|| PathBuf::from("/"));
    let mut disk_space = 0;
    let mut available_disk_space = 0;
    
    let disks = Disks::new_with_refreshed_list();
    for disk in &disks {
        if home_dir.starts_with(disk.mount_point()) {
            disk_space = disk.total_space();
            available_disk_space = disk.available_space();
            break;
        }
    }
    
    Ok(SystemInfo {
        platform,
        arch,
        total_memory,
        available_memory,
        disk_space,
        available_disk_space,
    })
}

#[tauri::command]
async fn get_crypto_config() -> Result<CryptoConfig, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    
    let bitcoin_data_dir = match std::env::consts::OS {
        "windows" => format!("{}\\AppData\\Roaming\\Bitcoin", home_dir.display()),
        "macos" => format!("{}/.bitcoin", home_dir.display()),
        _ => format!("{}/.bitcoin", home_dir.display()),
    };
    
    let whive_data_dir = match std::env::consts::OS {
        "windows" => format!("{}\\AppData\\Roaming\\Whive", home_dir.display()),
        "macos" => format!("{}/.whive", home_dir.display()),
        _ => format!("{}/.whive", home_dir.display()),
    };
    
    Ok(CryptoConfig {
        bitcoin_version: "29.0".to_string(),
        whive_version: "22.2.2".to_string(),
        bitcoin_data_dir,
        whive_data_dir,
    })
}

#[tauri::command]
async fn get_bitcoin_download_url() -> Result<String, String> {
    let os_type = std::env::consts::OS;
    let arch = std::env::consts::ARCH;
    let version = "29.0";
    
    let url = match (os_type, arch) {
        ("macos", "aarch64") => format!("https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-arm64-apple-darwin.tar.gz", version, version),
        ("macos", _) => format!("https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-x86_64-apple-darwin.tar.gz", version, version),
        ("linux", "aarch64") => format!("https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-aarch64-linux-gnu.tar.gz", version, version),
        ("linux", _) => format!("https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-x86_64-linux-gnu.tar.gz", version, version),
        ("windows", _) => format!("https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-win64-setup.exe", version, version),
        _ => format!("https://bitcoincore.org/bin/bitcoin-core-{}/bitcoin-{}-x86_64-apple-darwin.tar.gz", version, version),
    };
    
    Ok(url)
}

#[tauri::command]
async fn get_whive_download_url() -> Result<String, String> {
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

#[tauri::command]
async fn download_and_install_bitcoin(state: State<'_, AppState>) -> Result<String, String> {
    let url = get_bitcoin_download_url().await?;
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let install_path = home_dir.join("bitcoin-core");
    let filename = url.split('/').last().unwrap_or("bitcoin.tar.gz");
    let downloaded_file = install_path.join(filename);
    
    fs::create_dir_all(&install_path).map_err(|e| e.to_string())?;
    
    // Download the file
    download_file_internal(&url, &downloaded_file, &state).await?;
    
    // Extract if it's a tar.gz file
    if filename.ends_with(".tar.gz") {
        extract_tarball(&downloaded_file, &install_path).await?;
        fs::remove_file(&downloaded_file).map_err(|e| e.to_string())?;
        
        // Set executable permissions
        set_executable_permissions(&install_path).await?;
        
        // Create Bitcoin configuration directories
        create_bitcoin_config_dirs().await?;
    }
    
    Ok("Bitcoin Core installed successfully".to_string())
}

#[tauri::command]
async fn download_and_install_whive(state: State<'_, AppState>) -> Result<String, String> {
    let url = get_whive_download_url().await?;
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let install_path = home_dir.join("whive-core");
    let filename = url.split('/').last().unwrap_or("whive.tar.gz");
    let downloaded_file = install_path.join(filename);
    
    fs::create_dir_all(&install_path).map_err(|e| e.to_string())?;
    
    // Download the file
    download_file_internal(&url, &downloaded_file, &state).await?;
    
    // Extract if it's a tar.gz file
    if filename.ends_with(".tar.gz") {
        extract_tarball(&downloaded_file, &install_path).await?;
        fs::remove_file(&downloaded_file).map_err(|e| e.to_string())?;
        
        // Set executable permissions
        set_executable_permissions(&install_path).await?;
    }
    
    Ok("Whive Core installed successfully".to_string())
}

async fn download_file_internal(
    url: &str,
    destination: &std::path::Path,
    state: &State<'_, AppState>,
) -> Result<(), String> {
    let client = reqwest::Client::new();
    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    
    if !response.status().is_success() {
        return Err(format!("Failed to download: HTTP {}", response.status()));
    }
    
    let total_size = response.content_length().unwrap_or(0);
    let mut downloaded = 0u64;
    let mut stream = response.bytes_stream();
    
    let mut file = fs::File::create(destination).map_err(|e| e.to_string())?;
    let start_time = std::time::Instant::now();
    
    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        
        downloaded += chunk.len() as u64;
        let elapsed = start_time.elapsed().as_secs_f64();
        let speed = if elapsed > 0.0 { downloaded as f64 / elapsed } else { 0.0 };
        
        // Update progress
        let progress = DownloadProgress {
            total_size,
            downloaded,
            speed,
            status: "downloading".to_string(),
        };
        
        state.downloads.lock().await.insert(url.to_string(), progress);
    }
    
    // Mark as completed
    let progress = DownloadProgress {
        total_size,
        downloaded,
        speed: 0.0,
        status: "completed".to_string(),
    };
    state.downloads.lock().await.insert(url.to_string(), progress);
    
    Ok(())
}

async fn extract_tarball(archive_path: &std::path::Path, extract_to: &std::path::Path) -> Result<(), String> {
    let file = fs::File::open(archive_path).map_err(|e| e.to_string())?;
    let tar = flate2::read::GzDecoder::new(file);
    let mut archive = tar::Archive::new(tar);
    archive.unpack(extract_to).map_err(|e| e.to_string())?;
    Ok(())
}

async fn set_executable_permissions(base_path: &std::path::Path) -> Result<(), String> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        
        fn set_permissions_recursive(dir: &std::path::Path) -> Result<(), String> {
            for entry in fs::read_dir(dir).map_err(|e| e.to_string())? {
                let entry = entry.map_err(|e| e.to_string())?;
                let path = entry.path();
                
                if path.is_dir() {
                    if path.file_name().unwrap_or_default() == "bin" {
                        // Set executable permissions for all files in bin directory
                        for bin_entry in fs::read_dir(&path).map_err(|e| e.to_string())? {
                            let bin_entry = bin_entry.map_err(|e| e.to_string())?;
                            let bin_path = bin_entry.path();
                            if bin_path.is_file() {
                                let mut perms = fs::metadata(&bin_path).map_err(|e| e.to_string())?.permissions();
                                perms.set_mode(0o755);
                                fs::set_permissions(&bin_path, perms).map_err(|e| e.to_string())?;
                            }
                        }
                    } else {
                        set_permissions_recursive(&path)?;
                    }
                }
            }
            Ok(())
        }
        
        set_permissions_recursive(base_path)?;
    }
    
    Ok(())
}

async fn create_bitcoin_config_dirs() -> Result<(), String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let bitcoin_dir = home_dir.join(".bitcoin");
    let mainnet_dir = bitcoin_dir.join("mainnet");
    let pruned_dir = bitcoin_dir.join("pruned");
    
    fs::create_dir_all(&mainnet_dir).map_err(|e| e.to_string())?;
    fs::create_dir_all(&pruned_dir).map_err(|e| e.to_string())?;
    
    // Create bitcoin.conf files
    let mainnet_conf = mainnet_dir.join("bitcoin.conf");
    let pruned_conf = pruned_dir.join("bitcoin.conf");
    
    if !mainnet_conf.exists() {
        create_bitcoin_conf(&mainnet_conf, false).await?;
    }
    
    if !pruned_conf.exists() {
        create_bitcoin_conf(&pruned_conf, true).await?;
    }
    
    Ok(())
}

async fn create_bitcoin_conf(conf_path: &std::path::Path, prune: bool) -> Result<(), String> {
    let mut conf_content = vec![
        "daemon=1".to_string(),
    ];
    
    if prune {
        conf_content.push("prune=550".to_string());
    } else {
        // Only enable txindex when not pruning (they're incompatible)
        conf_content.push("txindex=1".to_string());
    }
    
    // OS-specific optimizations
    match std::env::consts::OS {
        "linux" => conf_content.push("dbcache=450".to_string()),
        "macos" => conf_content.push("dbcache=800".to_string()),
        _ => {}
    }
    
    // Architecture-specific optimizations
    match std::env::consts::ARCH {
        "aarch64" => conf_content.push("par=4".to_string()),
        _ => conf_content.push("par=8".to_string()),
    }
    
    fs::write(conf_path, conf_content.join("\n")).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn get_download_progress(
    url: String,
    state: State<'_, AppState>,
) -> Result<Option<DownloadProgress>, String> {
    let downloads = state.downloads.lock().await;
    Ok(downloads.get(&url).cloned())
}

#[tauri::command]
async fn execute_command(
    command: String,
    args: Vec<String>,
    working_dir: Option<String>,
) -> Result<String, String> {
    let mut cmd = Command::new(&command);
    cmd.args(&args);
    
    if let Some(dir) = working_dir {
        cmd.current_dir(dir);
    }
    
    cmd.stdout(Stdio::piped())
        .stderr(Stdio::piped());
    
    let output = cmd.output().map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn start_process(
    command: String,
    args: Vec<String>,
    working_dir: Option<String>,
    state: State<'_, AppState>,
) -> Result<u32, String> {
    let mut cmd = Command::new(&command);
    cmd.args(&args);
    
    if let Some(dir) = working_dir {
        cmd.current_dir(dir);
    }
    
    let child = cmd.spawn().map_err(|e| e.to_string())?;
    let pid = child.id();
    
    state.processes.lock().await.insert(command.clone(), pid);
    
    Ok(pid)
}

#[tauri::command]
async fn stop_process(
    process_name: String,
    state: State<'_, AppState>,
) -> Result<String, String> {
    let mut processes = state.processes.lock().await;
    
    if let Some(pid) = processes.remove(&process_name) {
        // Try to terminate the process gracefully
        #[cfg(unix)]
        {
            let _ = Command::new("kill")
                .args(&["-TERM", &pid.to_string()])
                .output();
        }
        
        #[cfg(windows)]
        {
            let _ = Command::new("taskkill")
                .args(&["/PID", &pid.to_string(), "/F"])
                .output();
        }
        
        Ok("Process terminated".to_string())
    } else {
        Err("Process not found".to_string())
    }
}

#[tauri::command]
async fn verify_file_hash(
    file_path: String,
    expected_hash: String,
) -> Result<bool, String> {
    use sha2::{Sha256, Digest};
    
    let contents = fs::read(&file_path).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    hasher.update(&contents);
    let result = hasher.finalize();
    let file_hash = hex::encode(result);
    
    Ok(file_hash.to_lowercase() == expected_hash.to_lowercase())
}

#[tauri::command]
async fn create_directory(path: String) -> Result<String, String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())?;
    Ok(format!("Directory created: {}", path))
}

#[tauri::command]
async fn check_file_exists(path: String) -> Result<bool, String> {
    Ok(std::path::Path::new(&path).exists())
}

#[tauri::command]
async fn get_file_size(path: String) -> Result<u64, String> {
    let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
    Ok(metadata.len())
}

#[tauri::command]
async fn get_hardware_info() -> Result<HardwareInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let cpu_cores = sys.physical_core_count().unwrap_or(0);
    let cpu_threads = sys.cpus().len();
    let cpu_brand = sys.cpus().first()
        .map(|cpu| cpu.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    let cpu_frequency = sys.cpus().first()
        .map(|cpu| cpu.frequency())
        .unwrap_or(0);
    
    // For now, we'll simulate GPU detection
    // In a real implementation, you'd use libraries like nvml-wrapper for NVIDIA or similar for AMD
    let gpu_devices = detect_gpu_devices();
    
    Ok(HardwareInfo {
        cpu_cores,
        cpu_threads,
        cpu_brand,
        cpu_frequency,
        gpu_devices,
        total_memory: sys.total_memory(),
        available_memory: sys.available_memory(),
    })
}

fn detect_gpu_devices() -> Vec<GpuDevice> {
    // This is a simplified GPU detection
    // In production, you'd use proper GPU detection libraries
    let mut devices = Vec::new();
    
    // Try to detect NVIDIA GPUs
    if let Ok(output) = Command::new("nvidia-smi")
        .args(&["--query-gpu=name,memory.total,driver_version", "--format=csv,noheader,nounits"])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                let parts: Vec<&str> = line.split(',').map(|s| s.trim()).collect();
                if parts.len() >= 3 {
                    devices.push(GpuDevice {
                        name: parts[0].to_string(),
                        vendor: "NVIDIA".to_string(),
                        memory: parts[1].parse().unwrap_or(0) * 1024 * 1024, // Convert MB to bytes
                        compute_capability: "Unknown".to_string(),
                        driver_version: parts[2].to_string(),
                    });
                }
            }
        }
    }
    
    // Try to detect AMD GPUs (simplified)
    if let Ok(output) = Command::new("rocm-smi")
        .args(&["--showproductname", "--showmeminfo", "vram"])
        .output()
    {
        if output.status.success() {
            // Parse AMD GPU info (simplified)
            devices.push(GpuDevice {
                name: "AMD GPU".to_string(),
                vendor: "AMD".to_string(),
                memory: 8 * 1024 * 1024 * 1024, // 8GB default
                compute_capability: "Unknown".to_string(),
                driver_version: "Unknown".to_string(),
            });
        }
    }
    
    devices
}

#[tauri::command]
async fn get_mining_pools() -> Result<Vec<MiningPool>, String> {
    // Return a list of popular mining pools for different cryptocurrencies
    Ok(vec![
        // Bitcoin pools
        MiningPool {
            name: "Slush Pool".to_string(),
            url: "stratum+tcp://stratum.slushpool.com".to_string(),
            port: 4444,
            fee: 2.0,
            location: "Global".to_string(),
            algorithm: "SHA256".to_string(),
            status: "Active".to_string(),
        },
        MiningPool {
            name: "F2Pool".to_string(),
            url: "stratum+tcp://btc.f2pool.com".to_string(),
            port: 1314,
            fee: 2.5,
            location: "Global".to_string(),
            algorithm: "SHA256".to_string(),
            status: "Active".to_string(),
        },
        MiningPool {
            name: "Antpool".to_string(),
            url: "stratum+tcp://stratum.antpool.com".to_string(),
            port: 3333,
            fee: 2.5,
            location: "Global".to_string(),
            algorithm: "SHA256".to_string(),
            status: "Active".to_string(),
        },
        // Whive pools
        MiningPool {
            name: "Whive Pool 1".to_string(),
            url: "stratum+tcp://pool1.whive.io".to_string(),
            port: 4444,
            fee: 1.0,
            location: "Global".to_string(),
            algorithm: "YescryptR32".to_string(),
            status: "Active".to_string(),
        },
        MiningPool {
            name: "Whive Pool 2".to_string(),
            url: "stratum+tcp://pool2.whive.io".to_string(),
            port: 3333,
            fee: 1.5,
            location: "Europe".to_string(),
            algorithm: "YescryptR32".to_string(),
            status: "Active".to_string(),
        },
        MiningPool {
            name: "Solo Mining".to_string(),
            url: "solo".to_string(),
            port: 0,
            fee: 0.0,
            location: "Local".to_string(),
            algorithm: "Any".to_string(),
            status: "Available".to_string(),
        },
    ])
}

#[tauri::command]
async fn save_mining_config(config: MiningConfig) -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let config_dir = home_dir.join(".melanin_click");
    
    fs::create_dir_all(&config_dir).map_err(|e| e.to_string())?;
    
    let config_file = config_dir.join("mining_config.json");
    let config_json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    
    fs::write(&config_file, config_json).map_err(|e| e.to_string())?;
    
    Ok("Mining configuration saved successfully".to_string())
}

#[tauri::command]
async fn load_mining_config() -> Result<Option<MiningConfig>, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let config_file = home_dir.join(".melanin_click").join("mining_config.json");
    
    if !config_file.exists() {
        return Ok(None);
    }
    
    let config_json = fs::read_to_string(&config_file).map_err(|e| e.to_string())?;
    let config: MiningConfig = serde_json::from_str(&config_json).map_err(|e| e.to_string())?;
    
    Ok(Some(config))
}

#[tauri::command]
async fn run_bitcoin_mainnet() -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let bitcoin_path = find_bitcoin_executable(&home_dir)?;
    let mainnet_conf_dir = home_dir.join(".bitcoin/mainnet");
    let conf_path = mainnet_conf_dir.join("bitcoin.conf");
    
    if !conf_path.exists() {
        fs::create_dir_all(&mainnet_conf_dir).map_err(|e| e.to_string())?;
        create_bitcoin_conf(&conf_path, false).await?;
    }
    
    let mut cmd = Command::new(&bitcoin_path);
    cmd.arg(format!("-conf={}", conf_path.display()));
    
    let child = cmd.spawn().map_err(|e| e.to_string())?;
    
    Ok(format!("Started Bitcoin mainnet node with PID: {}", child.id()))
}

#[tauri::command]
async fn run_bitcoin_pruned() -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let bitcoin_path = find_bitcoin_executable(&home_dir)?;
    let pruned_conf_dir = home_dir.join(".bitcoin/pruned");
    let conf_path = pruned_conf_dir.join("bitcoin.conf");
    
    if !conf_path.exists() {
        fs::create_dir_all(&pruned_conf_dir).map_err(|e| e.to_string())?;
        create_bitcoin_conf(&conf_path, true).await?;
    }
    
    let mut cmd = Command::new(&bitcoin_path);
    cmd.arg(format!("--datadir={}", pruned_conf_dir.display()));
    cmd.arg(format!("-conf={}", conf_path.display()));
    
    let child = cmd.spawn().map_err(|e| e.to_string())?;
    
    Ok(format!("Started Bitcoin pruned node with PID: {}", child.id()))
}

#[tauri::command]
async fn run_whive_node() -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let whive_path = find_whive_executable(&home_dir)?;
    
    let child = Command::new(&whive_path)
        .spawn()
        .map_err(|e| e.to_string())?;
    
    Ok(format!("Started Whive node with PID: {}", child.id()))
}

#[tauri::command]
async fn check_bitcoin_status() -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let cli_path = find_bitcoin_cli_executable(&home_dir)?;
    
    let output = Command::new(&cli_path)
        .arg("getblockchaininfo")
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn check_whive_status() -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let cli_path = find_whive_cli_executable(&home_dir)?;
    
    let output = Command::new(&cli_path)
        .arg("getblockchaininfo")
        .output()
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn start_bitcoin_mining(
    bitcoin_address: String,
    worker_name: String,
    pool_name: String,
) -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let minerd_path = home_dir.join("whive-core/whive/miner/minerd");
    
    if !minerd_path.exists() {
        return Err("Bitcoin miner not found at ~/whive-core/whive/miner/minerd".to_string());
    }
    
    // Pool URLs based on Python implementation
    let pool_url = match pool_name.as_str() {
        "CKPool" => "stratum+tcp://solo.ckpool.org:3333",
        "Public Pool" => "stratum+tcp://public-pool.io:21496",
        "Ocean Pool" => "stratum+tcp://stratum.ocean.xyz:3000",
        "Ocean Pool (Alt)" => "stratum+tcp://mine.ocean.xyz:3334",
        _ => "stratum+tcp://solo.ckpool.org:3333",
    };
    
    let user_string = format!("{}.{}", bitcoin_address, worker_name);
    let cmd_args = vec![
        "-a", "sha256d",
        "-o", pool_url,
        "-u", &user_string,
        "-p", "x"
    ];
    
    start_terminal_command(&minerd_path, &cmd_args, "Bitcoin").await
}

#[tauri::command]
async fn start_whive_mining(whive_address: String) -> Result<String, String> {
    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let minerd_path = home_dir.join("whive-core/whive/miner/minerd");
    
    if !minerd_path.exists() {
        return Err("Whive miner not found".to_string());
    }
    
    let user_string = format!("{}.w1", whive_address);
    let cmd_args = vec![
        "-a", "yespower",
        "-o", "stratum+tcp://206.189.2.17:3333",
        "-u", &user_string,
        "-t", "2"
    ];
    
    start_terminal_command(&minerd_path, &cmd_args, "Whive").await
}

async fn start_terminal_command(
    executable: &std::path::Path,
    args: &[&str],
    software: &str,
) -> Result<String, String> {
    let cmd_string = format!("{} {}", executable.display(), args.join(" "));
    
    match std::env::consts::OS {
        "macos" => {
            let osascript_cmd = format!(
                r#"osascript -e 'tell application "Terminal" to do script "{}"'"#,
                cmd_string
            );
            Command::new("sh")
                .arg("-c")
                .arg(&osascript_cmd)
                .spawn()
                .map_err(|e| e.to_string())?;
        },
        "linux" => {
            // Try common Linux terminal emulators
            let terminals = ["gnome-terminal", "xterm", "konsole", "xfce4-terminal"];
            let mut terminal_found = false;
            
            for terminal in &terminals {
                if Command::new("which")
                    .arg(terminal)
                    .output()
                    .map(|output| output.status.success())
                    .unwrap_or(false)
                {
                    let bash_cmd = format!("{}; exec bash", cmd_string);
                    let terminal_args = match *terminal {
                        "gnome-terminal" => vec!["--", "bash", "-c", &bash_cmd],
                        _ => vec!["-e", &cmd_string],
                    };
                    
                    Command::new(terminal)
                        .args(&terminal_args)
                        .spawn()
                        .map_err(|e| e.to_string())?;
                    
                    terminal_found = true;
                    break;
                }
            }
            
            if !terminal_found {
                return Err("No suitable terminal found. Try installing xterm.".to_string());
            }
        },
        _ => {
            return Err(format!("Unsupported platform: {}", std::env::consts::OS));
        }
    }
    
    Ok(format!("Started {} mining in terminal", software))
}

fn find_bitcoin_executable(home_dir: &std::path::Path) -> Result<std::path::PathBuf, String> {
    let base_path = home_dir.join("bitcoin-core");
    find_executable_in_path(&base_path, "bitcoin-qt")
}

fn find_bitcoin_cli_executable(home_dir: &std::path::Path) -> Result<std::path::PathBuf, String> {
    let base_path = home_dir.join("bitcoin-core");
    find_executable_in_path(&base_path, "bitcoin-cli")
}

fn find_whive_executable(home_dir: &std::path::Path) -> Result<std::path::PathBuf, String> {
    let base_path = home_dir.join("whive-core");
    find_executable_in_path(&base_path, "whive-qt")
}

fn find_whive_cli_executable(home_dir: &std::path::Path) -> Result<std::path::PathBuf, String> {
    let base_path = home_dir.join("whive-core");
    find_executable_in_path(&base_path, "whive-cli")
}

fn find_executable_in_path(base_path: &std::path::Path, executable_name: &str) -> Result<std::path::PathBuf, String> {
    fn search_recursive(dir: &std::path::Path, target: &str) -> Option<std::path::PathBuf> {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(found) = search_recursive(&path, target) {
                        return Some(found);
                    }
                } else if path.file_name()
                    .and_then(|name| name.to_str())
                    .map(|name| name.contains(target))
                    .unwrap_or(false)
                {
                    return Some(path);
                }
            }
        }
        None
    }
    
    search_recursive(base_path, executable_name)
        .ok_or_else(|| format!("{} executable not found in {}", executable_name, base_path.display()))
}

#[tauri::command]
async fn stop_mining(state: State<'_, AppState>) -> Result<String, String> {
    let mut processes = state.processes.lock().await;
    
    if let Some(pid) = processes.remove("miner") {
        #[cfg(unix)]
        {
            let _ = Command::new("kill")
                .args(&["-TERM", &pid.to_string()])
                .output();
        }
        
        #[cfg(windows)]
        {
            let _ = Command::new("taskkill")
                .args(&["/PID", &pid.to_string(), "/F"])
                .output();
        }
        
        Ok("Mining stopped".to_string())
    } else {
        Err("No mining process found".to_string())
    }
}

#[tauri::command]
async fn get_mining_stats() -> Result<MiningStats, String> {
    // In a real implementation, this would parse miner output or API
    // For now, we'll return simulated stats
    Ok(MiningStats {
        hashrate: 1250.5, // H/s
        accepted_shares: 42,
        rejected_shares: 1,
        uptime: 3600, // seconds
        temperature: 65.0, // Celsius
        power_consumption: 150.0, // Watts
        estimated_earnings: 0.00001234, // BTC/day
    })
}

#[tauri::command]
async fn benchmark_hardware() -> Result<HashMap<String, f64>, String> {
    // Simulate hardware benchmarking
    // In production, this would run actual benchmark tests
    let mut results = HashMap::new();
    
    results.insert("CPU_SHA256".to_string(), 1250.5);
    results.insert("CPU_Yespower".to_string(), 850.2);
    results.insert("GPU_SHA256".to_string(), 15000.0);
    
    Ok(results)
}

#[tauri::command]
async fn validate_bitcoin_address(address: String) -> Result<bool, String> {
    // Basic Bitcoin address validation
    if address.is_empty() {
        return Ok(false);
    }

    // P2PKH addresses (start with 1)
    if address.starts_with('1') && address.len() >= 26 && address.len() <= 35 {
        return match bs58::decode(&address).into_vec() {
            Ok(decoded) => {
                if decoded.len() == 25 {
                    // Verify checksum
                    let (payload, checksum) = decoded.split_at(21);
                    let hash = sha2::Sha256::digest(&sha2::Sha256::digest(payload));
                    Ok(&hash[0..4] == checksum)
                } else {
                    Ok(false)
                }
            },
            Err(_) => Ok(false),
        };
    }

    // P2SH addresses (start with 3)
    if address.starts_with('3') && address.len() >= 26 && address.len() <= 35 {
        return match bs58::decode(&address).into_vec() {
            Ok(decoded) => {
                if decoded.len() == 25 {
                    let (payload, checksum) = decoded.split_at(21);
                    let hash = sha2::Sha256::digest(&sha2::Sha256::digest(payload));
                    Ok(&hash[0..4] == checksum)
                } else {
                    Ok(false)
                }
            },
            Err(_) => Ok(false),
        };
    }

    // Bech32 addresses (start with bc1)
    if address.starts_with("bc1") {
        return match bech32::decode(&address) {
            Ok((hrp, _data, _variant)) => Ok(hrp == "bc"),
            Err(_) => Ok(false),
        };
    }

    Ok(false)
}

#[tauri::command]
async fn validate_whive_address(address: String) -> Result<bool, String> {
    // Whive uses similar address format to Bitcoin but with different prefixes
    if address.is_empty() {
        return Ok(false);
    }

    // Whive P2PKH addresses typically start with 'W'
    if address.starts_with('W') && address.len() >= 26 && address.len() <= 35 {
        return match bs58::decode(&address).into_vec() {
            Ok(decoded) => {
                if decoded.len() == 25 {
                    let (payload, checksum) = decoded.split_at(21);
                    let hash = sha2::Sha256::digest(&sha2::Sha256::digest(payload));
                    Ok(&hash[0..4] == checksum)
                } else {
                    Ok(false)
                }
            },
            Err(_) => Ok(false),
        };
    }

    // Basic length and character validation for other Whive formats
    if address.len() >= 26 && address.len() <= 62 {
        // Check if it contains valid base58 characters
        let valid_chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        return Ok(address.chars().all(|c| valid_chars.contains(c)));
    }

    Ok(false)
}

#[tauri::command]
async fn get_real_mining_stats(mining_type: String) -> Result<MiningStats, String> {
    // Enhanced mining stats with real system monitoring
    let mut sys = System::new_all();
    sys.refresh_all();
    
    let cpu_usage = sys.global_cpu_usage();
    let memory_usage = sys.used_memory();
    let total_memory = sys.total_memory();
    
    // Simulate realistic mining stats based on system load
    let hashrate = if mining_type == "whive" {
        // Yespower hashrate typically ranges from 500-2000 H/s on modern CPUs
        if cpu_usage > 80.0 { 1850.5 } else { 950.2 }
    } else {
        // Bitcoin CPU mining (mostly symbolic)
        if cpu_usage > 80.0 { 125.8 } else { 65.3 }
    };
    
    Ok(MiningStats {
        hashrate,
        accepted_shares: if cpu_usage > 50.0 { 42 } else { 0 },
        rejected_shares: if cpu_usage > 90.0 { 2 } else { 0 },
        uptime: 3600, // seconds
        temperature: 45.0 + (cpu_usage * 0.3), // Realistic temperature based on CPU usage
        power_consumption: 50.0 + (cpu_usage * 1.5), // Realistic power consumption
        estimated_earnings: if mining_type == "whive" { 0.0001234 } else { 0.00000001 },
    })
}

#[tauri::command]
async fn start_enhanced_whive_mining(
    whive_address: String,
    threads: Option<u32>,
    intensity: Option<u8>,
) -> Result<String, String> {
    // Validate address first
    let is_valid = validate_whive_address(whive_address.clone()).await?;
    if !is_valid {
        return Err("Invalid Whive address format".to_string());
    }

    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let minerd_path = home_dir.join("whive-core/whive/miner/minerd");
    
    if !minerd_path.exists() {
        return Err("Whive miner not found. Please install Whive first.".to_string());
    }
    
    let num_threads = threads.unwrap_or(2).to_string();
    let user_string = format!("{}.melanin_worker", whive_address);
    
    let cmd_args = vec![
        "-a", "yespower",
        "-o", "stratum+tcp://206.189.2.17:3333",
        "-u", &user_string,
        "-t", &num_threads,
        "-q", // Quiet mode
    ];
    
    start_terminal_command(&minerd_path, &cmd_args, "Whive").await
}

#[tauri::command]
async fn start_enhanced_bitcoin_mining(
    bitcoin_address: String,
    worker_name: String,
    pool_name: String,
    threads: Option<u32>,
) -> Result<String, String> {
    // Validate address first
    let is_valid = validate_bitcoin_address(bitcoin_address.clone()).await?;
    if !is_valid {
        return Err("Invalid Bitcoin address format".to_string());
    }

    let home_dir = dirs::home_dir().ok_or("Could not find home directory")?;
    let minerd_path = home_dir.join("whive-core/whive/miner/minerd");
    
    if !minerd_path.exists() {
        return Err("Bitcoin miner not found. Please install Whive package first.".to_string());
    }
    
    // Enhanced pool selection with better defaults
    let pool_url = match pool_name.as_str() {
        "CKPool Solo" => "stratum+tcp://solo.ckpool.org:3333",
        "CKPool" => "stratum+tcp://stratum.ckpool.org:3333", 
        "Public Pool" => "stratum+tcp://public-pool.io:21496",
        "Ocean Pool" => "stratum+tcp://stratum.ocean.xyz:3000",
        "F2Pool" => "stratum+tcp://btc.f2pool.com:1314",
        _ => "stratum+tcp://solo.ckpool.org:3333",
    };
    
    let num_threads = threads.unwrap_or(1).to_string();
    let user_string = format!("{}.{}", bitcoin_address, worker_name);
    
    let cmd_args = vec![
        "-a", "sha256d",
        "-o", pool_url,
        "-u", &user_string,
        "-p", "x",
        "-t", &num_threads,
        "-q", // Quiet mode
    ];
    
    start_terminal_command(&minerd_path, &cmd_args, "Bitcoin").await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .manage(AppState::default())
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            get_crypto_config,
            get_bitcoin_download_url,
            get_whive_download_url,
            download_and_install_bitcoin,
            download_and_install_whive,
            run_bitcoin_mainnet,
            run_bitcoin_pruned,
            run_whive_node,
            check_bitcoin_status,
            check_whive_status,
            start_bitcoin_mining,
            start_whive_mining,
            start_enhanced_bitcoin_mining,
            start_enhanced_whive_mining,
            get_download_progress,
            execute_command,
            start_process,
            stop_process,
            verify_file_hash,
            create_directory,
            check_file_exists,
            get_file_size,
            get_hardware_info,
            get_mining_pools,
            save_mining_config,
            load_mining_config,
            stop_mining,
            get_mining_stats,
            get_real_mining_stats,
            benchmark_hardware,
            validate_bitcoin_address,
            validate_whive_address
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
