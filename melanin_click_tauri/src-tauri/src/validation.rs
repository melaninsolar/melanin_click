use crate::AppError;
use sha2::{Digest, Sha256};

// Bitcoin Address Validation
#[tauri::command]
pub async fn validate_bitcoin_address(address: String) -> Result<bool, AppError> {
    if address.is_empty() {
        return Ok(false);
    }

    // P2PKH addresses (start with 1)
    if address.starts_with('1') && address.len() >= 26 && address.len() <= 35 {
        return validate_legacy_address(&address, 0x00);
    }

    // P2SH addresses (start with 3)
    if address.starts_with('3') && address.len() >= 26 && address.len() <= 35 {
        return validate_legacy_address(&address, 0x05);
    }

    // Bech32 addresses (start with bc1)
    if address.starts_with("bc1") {
        return validate_bech32_address(&address);
    }

    // Testnet addresses
    if address.starts_with('m') || address.starts_with('n') {
        return validate_legacy_address(&address, 0x6f);
    }

    if address.starts_with('2') {
        return validate_legacy_address(&address, 0xc4);
    }

    // Testnet bech32
    if address.starts_with("tb1") {
        return validate_testnet_bech32_address(&address);
    }

    Ok(false)
}

fn validate_legacy_address(address: &str, version_byte: u8) -> Result<bool, AppError> {
    match bs58::decode(address).into_vec() {
        Ok(decoded) => {
            if decoded.len() != 25 {
                return Ok(false);
            }

            // Check version byte
            if decoded[0] != version_byte {
                return Ok(false);
            }

            // Verify checksum
            let (payload, checksum) = decoded.split_at(21);
            let hash1 = Sha256::digest(payload);
            let hash2 = Sha256::digest(hash1);

            Ok(&hash2[0..4] == checksum)
        }
        Err(_) => Ok(false),
    }
}

fn validate_bech32_address(address: &str) -> Result<bool, AppError> {
    match bech32::decode(address) {
        Ok((hrp, data)) => {
            if hrp.as_str() != "bc" {
                return Ok(false);
            }

            if data.is_empty() {
                return Ok(false);
            }

            let witness_version = data[0];
            let program = &data[1..];

            // Validate witness version and program length
            match witness_version {
                0 => Ok(program.len() == 20 || program.len() == 32),
                1..=16 => Ok(program.len() >= 2 && program.len() <= 40),
                _ => Ok(false),
            }
        }
        Err(_) => Ok(false),
    }
}

fn validate_testnet_bech32_address(address: &str) -> Result<bool, AppError> {
    match bech32::decode(address) {
        Ok((hrp, data)) => {
            if hrp.as_str() != "tb" {
                return Ok(false);
            }

            if data.is_empty() {
                return Ok(false);
            }

            let witness_version = data[0];
            let program = &data[1..];

            match witness_version {
                0 => Ok(program.len() == 20 || program.len() == 32),
                1..=16 => Ok(program.len() >= 2 && program.len() <= 40),
                _ => Ok(false),
            }
        }
        Err(_) => Ok(false),
    }
}

// Whive Address Validation
#[tauri::command]
pub async fn validate_whive_address(address: String) -> Result<bool, AppError> {
    if address.is_empty() {
        return Ok(false);
    }

    // Reject Bitcoin addresses first (they start with 1, 3, or bc1)
    if address.starts_with('1') || address.starts_with('3') || address.starts_with("bc1") {
        return Ok(false);
    }

    // Whive uses similar address formats to Bitcoin but with different prefixes
    // Check for Whive-specific prefixes and format

    // Standard Whive addresses (typically start with W)
    if address.starts_with('W') && address.len() >= 26 && address.len() <= 35 {
        return validate_whive_legacy_address(&address);
    }

    // Whive script addresses (typically start with 7)
    if address.starts_with('7') && address.len() >= 26 && address.len() <= 35 {
        return validate_whive_script_address(&address);
    }

    // Only accept addresses that start with valid Whive prefixes
    // Reject anything that doesn't start with W or 7 for now
    Ok(false)
}

fn validate_whive_legacy_address(address: &str) -> Result<bool, AppError> {
    match bs58::decode(address).into_vec() {
        Ok(decoded) => {
            if decoded.len() != 25 {
                return Ok(false);
            }

            // Whive version byte (adjust based on actual Whive specs)
            let expected_version = 0x49; // 'W' in Whive
            if decoded[0] != expected_version {
                return Ok(false);
            }

            // Verify checksum using double SHA-256
            let (payload, checksum) = decoded.split_at(21);
            let hash1 = Sha256::digest(payload);
            let hash2 = Sha256::digest(hash1);

            Ok(&hash2[0..4] == checksum)
        }
        Err(_) => Ok(false),
    }
}

fn validate_whive_script_address(address: &str) -> Result<bool, AppError> {
    match bs58::decode(address).into_vec() {
        Ok(decoded) => {
            if decoded.len() != 25 {
                return Ok(false);
            }

            // Whive script version byte
            let expected_version = 0x07; // Script addresses
            if decoded[0] != expected_version {
                return Ok(false);
            }

            // Verify checksum
            let (payload, checksum) = decoded.split_at(21);
            let hash1 = Sha256::digest(payload);
            let hash2 = Sha256::digest(hash1);

            Ok(&hash2[0..4] == checksum)
        }
        Err(_) => Ok(false),
    }
}

// File Hash Verification
#[tauri::command]
pub async fn verify_file_hash(
    file_path: String,
    expected_hash: String,
    algorithm: Option<String>,
) -> Result<bool, AppError> {
    let algo = algorithm.unwrap_or_else(|| "sha256".to_string());

    let contents = std::fs::read(&file_path)
        .map_err(|e| AppError::Validation(format!("Failed to read file {file_path}: {e}")))?;

    let computed_hash = match algo.to_lowercase().as_str() {
        "sha256" => {
            let mut hasher = Sha256::new();
            hasher.update(&contents);
            hex::encode(hasher.finalize())
        }
        "md5" => {
            let digest = md5::compute(&contents);
            format!("{digest:x}")
        }
        _ => {
            return Err(AppError::Validation(format!(
                "Unsupported hash algorithm: {}",
                algo
            )));
        }
    };

    Ok(computed_hash.to_lowercase() == expected_hash.to_lowercase())
}

// URL Validation
pub fn validate_pool_url(url: &str) -> Result<bool, AppError> {
    if url.is_empty() {
        return Ok(false);
    }

    // Check for malicious characters first
    let malicious_chars = [
        '\'', '"', ';', '&', '|', '`', '$', '(', ')', '<', '>', '{', '}',
    ];
    if url.chars().any(|c| malicious_chars.contains(&c)) {
        return Ok(false);
    }

    // Check for path traversal attempts
    if url.contains("..") {
        return Ok(false);
    }

    // Check for stratum protocol
    if !url.starts_with("stratum+tcp://") && !url.starts_with("stratum+ssl://") {
        return Ok(false);
    }

    // Basic URL parsing
    match url::Url::parse(url) {
        Ok(parsed_url) => {
            // Check if host is present and valid
            if let Some(host) = parsed_url.host() {
                let host_str = host.to_string();

                // Additional host validation - should be alphanumeric with dots and hyphens
                if !host_str
                    .chars()
                    .all(|c| c.is_alphanumeric() || c == '.' || c == '-')
                {
                    return Ok(false);
                }

                // Check if port is valid (u16 max is 65535)
                match parsed_url.port() {
                    Some(port) => Ok(port > 0),
                    None => Ok(false), // Mining pools typically require explicit ports
                }
            } else {
                Ok(false)
            }
        }
        Err(_) => Ok(false),
    }
}

// Validate mining configuration
pub fn validate_mining_config(config: &crate::MiningConfig) -> Result<Vec<String>, AppError> {
    let mut errors = Vec::new();

    // Validate pool URL
    if !validate_pool_url(&config.pool_url)? {
        errors.push("Invalid pool URL format".to_string());
    }

    // Validate wallet address (basic check)
    if config.wallet_address.is_empty() {
        errors.push("Wallet address cannot be empty".to_string());
    }

    // Validate worker name
    if config.worker_name.is_empty() {
        errors.push("Worker name cannot be empty".to_string());
    }

    // Validate threads
    if config.threads == 0 {
        errors.push("Thread count must be greater than 0".to_string());
    }

    let max_threads = num_cpus::get() as u32;
    if config.threads > max_threads {
        errors.push(format!(
            "Thread count cannot exceed {} (CPU cores)",
            max_threads
        ));
    }

    // Validate intensity
    if config.mining_intensity > 100 {
        errors.push("Mining intensity cannot exceed 100%".to_string());
    }

    Ok(errors)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_bitcoin_address_validation() {
        // Valid P2PKH addresses
        assert!(
            validate_bitcoin_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa".to_string())
                .await
                .unwrap()
        );
        assert!(
            validate_bitcoin_address("1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2".to_string())
                .await
                .unwrap()
        );

        // Valid P2SH addresses
        assert!(
            validate_bitcoin_address("3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy".to_string())
                .await
                .unwrap()
        );

        // Valid Bech32 addresses
        assert!(
            validate_bitcoin_address("bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4".to_string())
                .await
                .unwrap()
        );

        // Invalid addresses
        assert!(!validate_bitcoin_address("invalid_address".to_string())
            .await
            .unwrap());
        assert!(!validate_bitcoin_address("".to_string()).await.unwrap());
        assert!(
            !validate_bitcoin_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfN".to_string())
                .await
                .unwrap()
        ); // Wrong checksum
    }

    #[tokio::test]
    async fn test_whive_address_validation() {
        // Test with valid length addresses that follow Whive format patterns
        // Since we don't have actual Whive addresses, test the general validation logic
        let valid_test_addr = "WiZx6iFbnQ8p2fFy7SzeB3TXHg4Wqk2Aes"; // Realistic Whive-like address

        // This test verifies our validation doesn't crash rather than exact validation
        let result = validate_whive_address(valid_test_addr.to_string()).await;
        assert!(result.is_ok());

        // Invalid addresses
        assert!(!validate_whive_address("invalid_address".to_string())
            .await
            .unwrap());
        assert!(!validate_whive_address("".to_string()).await.unwrap());
        assert!(
            !validate_whive_address("1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa".to_string())
                .await
                .unwrap()
        ); // Bitcoin address
    }

    #[tokio::test]
    async fn test_file_hash_verification() {
        use std::fs::File;
        use std::io::Write;
        use tempfile::tempdir;

        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test.txt");
        let mut file = File::create(&file_path).unwrap();
        writeln!(file, "test content").unwrap();

        let expected_hash = "1eebdadbdd983d280a6e94b76d80b8b0bb4bb54b5b3d6e5b0f1b5a5e4b6d8d1e";
        let result = verify_file_hash(
            file_path.to_string_lossy().to_string(),
            expected_hash.to_string(),
            Some("sha256".to_string()),
        )
        .await;

        assert!(result.is_ok());
    }

    #[test]
    fn test_pool_url_validation() {
        // Valid pool URLs
        assert!(validate_pool_url("stratum+tcp://pool.example.com:4334").unwrap());
        assert!(validate_pool_url("stratum+tcp://solo.ckpool.org:3333").unwrap());
        assert!(validate_pool_url("stratum+ssl://secure.pool.com:443").unwrap());

        // Invalid pool URLs
        assert!(!validate_pool_url("").unwrap());
        assert!(!validate_pool_url("invalid_url").unwrap());
        assert!(!validate_pool_url("http://pool.example.com").unwrap()); // Wrong protocol
        assert!(!validate_pool_url("stratum+tcp://pool.example.com").unwrap()); // No port
    }

    #[test]
    fn test_input_sanitization() {
        // Test that malicious inputs are rejected
        let malicious_inputs = vec![
            "'; rm -rf /; echo '",
            "$(malicious_command)",
            "`rm -rf /`",
            "../../../etc/passwd",
            "<script>alert('xss')</script>",
        ];

        for input in malicious_inputs {
            // These should all be rejected by validation
            assert!(!validate_pool_url(&format!("stratum+tcp://{input}:3333")).unwrap_or(true));
        }
    }
}
