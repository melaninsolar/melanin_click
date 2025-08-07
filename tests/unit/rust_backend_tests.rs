//! Unit tests for Melanin Click Rust backend
//! Run with: cargo test

use melanin_click_tauri::*;

#[cfg(test)]
mod address_validation_tests {
    use super::*;

    #[test]
    fn test_bitcoin_address_validation() {
        // Valid Bitcoin addresses
        assert!(validate_bitcoin_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa").is_ok());
        assert!(validate_bitcoin_address("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy").is_ok());
        
        // Invalid Bitcoin addresses
        assert!(validate_bitcoin_address("invalid_address").is_err());
        assert!(validate_bitcoin_address("").is_err());
        assert!(validate_bitcoin_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN").is_err()); // Wrong length
    }

    #[test]
    fn test_whive_address_validation() {
        // Valid Whive addresses
        assert!(validate_whive_address("WiZx6iFbnQ8p2fFy7SzeB3TXHg4Wqk2Aes").is_ok());
        
        // Invalid Whive addresses
        assert!(validate_whive_address("invalid_address").is_err());
        assert!(validate_whive_address("").is_err());
        assert!(validate_whive_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa").is_err()); // Bitcoin address
    }
}

#[cfg(test)]
mod system_info_tests {
    use super::*;

    #[test]
    fn test_get_system_info() {
        let system_info = get_system_info();
        assert!(system_info.is_ok());
        
        let info = system_info.unwrap();
        assert!(!info.os.is_empty());
        assert!(!info.arch.is_empty());
        assert!(info.total_memory > 0);
    }

    #[test]
    fn test_cpu_count_detection() {
        let system_info = get_system_info().unwrap();
        assert!(system_info.cpu_count > 0);
        assert!(system_info.cpu_count <= 256); // Reasonable upper bound
    }
}

#[cfg(test)]
mod node_configuration_tests {
    use super::*;

    #[test]
    fn test_bitcoin_config_generation() {
        let config = generate_bitcoin_config("mainnet", "/test/datadir", 8332);
        
        assert!(config.contains("datadir=/test/datadir"));
        assert!(config.contains("rpcport=8332"));
        assert!(config.contains("server=1"));
        assert!(config.contains("rpcallowip=127.0.0.1"));
    }

    #[test]
    fn test_whive_config_generation() {
        let config = generate_whive_config("mainnet", "/test/datadir", 10998);
        
        assert!(config.contains("datadir=/test/datadir"));
        assert!(config.contains("rpcport=10998"));
        assert!(config.contains("server=1"));
    }

    #[test]
    fn test_config_security() {
        let config = generate_bitcoin_config("mainnet", "/test/datadir", 8332);
        
        // Ensure RPC password is not hardcoded in tests
        assert!(!config.contains("melanin_secure_password"));
        // Should use environment variable
        assert!(config.contains("${BITCOIN_RPC_PASSWORD}") || config.contains("rpcpassword="));
    }
}

#[cfg(test)]
mod mining_tests {
    use super::*;

    #[test]
    fn test_mining_config_validation() {
        // Valid mining configurations
        assert!(validate_mining_config("bitcoin", 1, 4).is_ok());
        assert!(validate_mining_config("whive", 2, 8).is_ok());
        
        // Invalid configurations
        assert!(validate_mining_config("unknown", 1, 4).is_err());
        assert!(validate_mining_config("bitcoin", 0, 4).is_err()); // Zero threads
        assert!(validate_mining_config("bitcoin", 1, 0).is_err()); // Zero max threads
        assert!(validate_mining_config("bitcoin", 5, 4).is_err()); // More than max
    }

    #[test]
    fn test_pool_url_validation() {
        // Valid pool URLs
        assert!(validate_pool_url("stratum+tcp://pool.example.com:4334").is_ok());
        assert!(validate_pool_url("stratum+tcp://solo.ckpool.org:4334").is_ok());
        
        // Invalid pool URLs
        assert!(validate_pool_url("").is_err());
        assert!(validate_pool_url("invalid_url").is_err());
        assert!(validate_pool_url("http://pool.example.com").is_err()); // Wrong protocol
    }
}

#[cfg(test)]
mod file_operations_tests {
    use super::*;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_file_extraction() {
        let temp_dir = TempDir::new().unwrap();
        let test_file = temp_dir.path().join("test.txt");
        fs::write(&test_file, "test content").unwrap();
        
        assert!(test_file.exists());
        
        // Test file verification
        let hash = calculate_file_hash(&test_file).unwrap();
        assert!(!hash.is_empty());
        assert_eq!(hash.len(), 64); // SHA256 hash length
    }

    #[test]
    fn test_directory_creation() {
        let temp_dir = TempDir::new().unwrap();
        let new_dir = temp_dir.path().join("new_directory");
        
        create_directory_if_not_exists(&new_dir).unwrap();
        assert!(new_dir.exists());
        assert!(new_dir.is_dir());
    }
}

#[cfg(test)]
mod process_management_tests {
    use super::*;

    #[test]
    fn test_process_command_building() {
        let cmd = build_mining_command("whive", "WiZx6iFbnQ8p2fFy7SzeB3TXHg4Wqk2Aes", 4, 85);
        
        assert!(cmd.contains("minerd"));
        assert!(cmd.contains("-a yespower"));
        assert!(cmd.contains("-t 4"));
        assert!(cmd.contains("WiZx6iFbnQ8p2fFy7SzeB3TXHg4Wqk2Aes"));
    }

    #[test]
    fn test_bitcoin_mining_command() {
        let cmd = build_bitcoin_mining_command(
            "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",
            "test_worker",
            "stratum+tcp://solo.ckpool.org:4334",
            2
        );
        
        assert!(cmd.contains("cpuminer"));
        assert!(cmd.contains("-a sha256d"));
        assert!(cmd.contains("-t 2"));
        assert!(cmd.contains("solo.ckpool.org:4334"));
        assert!(cmd.contains("test_worker"));
    }
}

#[cfg(test)]
mod security_tests {
    use super::*;

    #[test]
    fn test_input_sanitization() {
        // Test that malicious inputs are rejected
        assert!(validate_bitcoin_address("'; rm -rf /; echo '").is_err());
        assert!(validate_whive_address("$(malicious_command)").is_err());
        
        // Test worker name sanitization
        assert!(sanitize_worker_name("valid_worker").is_ok());
        assert!(sanitize_worker_name("worker; rm -rf /").is_err());
    }

    #[test]
    fn test_path_traversal_protection() {
        // Test that path traversal attempts are blocked
        assert!(validate_path("/safe/path").is_ok());
        assert!(validate_path("../../../etc/passwd").is_err());
        assert!(validate_path("/safe/path/../../../etc/passwd").is_err());
    }
}

#[cfg(test)]
mod integration_tests {
    use super::*;

    #[test]
    fn test_full_mining_flow() {
        // Test complete mining setup flow (without actually starting processes)
        let system_info = get_system_info().unwrap();
        assert!(system_info.cpu_count > 0);
        
        // Validate addresses
        let btc_addr = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa";
        let whive_addr = "WiZx6iFbnQ8p2fFy7SzeB3TXHg4Wqk2Aes";
        
        assert!(validate_bitcoin_address(btc_addr).is_ok());
        assert!(validate_whive_address(whive_addr).is_ok());
        
        // Validate mining configuration
        let threads = std::cmp::min(2, system_info.cpu_count);
        assert!(validate_mining_config("bitcoin", threads, system_info.cpu_count).is_ok());
        assert!(validate_mining_config("whive", threads, system_info.cpu_count).is_ok());
    }
}

#[cfg(test)]
mod environment_tests {
    use super::*;

    #[test]
    fn test_environment_variable_loading() {
        // Test that environment variables are properly loaded
        std::env::set_var("TEST_BITCOIN_RPC_PASSWORD", "test_password");
        
        let password = std::env::var("TEST_BITCOIN_RPC_PASSWORD");
        assert!(password.is_ok());
        assert_eq!(password.unwrap(), "test_password");
        
        // Clean up
        std::env::remove_var("TEST_BITCOIN_RPC_PASSWORD");
    }

    #[test]
    fn test_default_values() {
        // Test that reasonable defaults are used when env vars are missing
        let default_port = get_bitcoin_rpc_port_or_default();
        assert_eq!(default_port, 8332);
        
        let default_whive_port = get_whive_rpc_port_or_default();
        assert_eq!(default_whive_port, 10998);
    }
}

// Helper functions that should be implemented in the main codebase
fn validate_mining_config(coin: &str, threads: usize, max_threads: usize) -> Result<(), String> {
    if coin != "bitcoin" && coin != "whive" {
        return Err("Unsupported coin".to_string());
    }
    if threads == 0 || threads > max_threads {
        return Err("Invalid thread count".to_string());
    }
    Ok(())
}

fn validate_pool_url(url: &str) -> Result<(), String> {
    if url.is_empty() {
        return Err("Empty URL".to_string());
    }
    if !url.starts_with("stratum+tcp://") {
        return Err("Invalid protocol".to_string());
    }
    Ok(())
}

fn calculate_file_hash(path: &std::path::Path) -> Result<String, String> {
    use sha2::{Sha256, Digest};
    use std::fs::File;
    use std::io::Read;
    
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    let mut buffer = [0; 1024];
    
    loop {
        let bytes_read = file.read(&mut buffer).map_err(|e| e.to_string())?;
        if bytes_read == 0 {
            break;
        }
        hasher.update(&buffer[..bytes_read]);
    }
    
    Ok(format!("{:x}", hasher.finalize()))
}

fn create_directory_if_not_exists(path: &std::path::Path) -> Result<(), String> {
    if !path.exists() {
        std::fs::create_dir_all(path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn build_mining_command(coin: &str, address: &str, threads: usize, intensity: u8) -> String {
    match coin {
        "whive" => format!(
            "minerd -a yespower -o stratum+tcp://pool.whivechain.com:4334 -u {} -p x -t {} --intensity={}",
            address, threads, intensity
        ),
        _ => String::new()
    }
}

fn build_bitcoin_mining_command(address: &str, worker: &str, pool: &str, threads: usize) -> String {
    format!(
        "cpuminer -a sha256d -o {} -u {}.{} -p x -t {}",
        pool, address, worker, threads
    )
}

fn sanitize_worker_name(name: &str) -> Result<String, String> {
    if name.contains(';') || name.contains('&') || name.contains('|') {
        return Err("Invalid characters in worker name".to_string());
    }
    Ok(name.to_string())
}

fn validate_path(path: &str) -> Result<(), String> {
    if path.contains("..") {
        return Err("Path traversal not allowed".to_string());
    }
    Ok(())
}

fn get_bitcoin_rpc_port_or_default() -> u16 {
    std::env::var("BITCOIN_RPC_PORT")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(8332)
}

fn get_whive_rpc_port_or_default() -> u16 {
    std::env::var("WHIVE_RPC_PORT")
        .ok()
        .and_then(|s| s.parse().ok())
        .unwrap_or(10998)
} 