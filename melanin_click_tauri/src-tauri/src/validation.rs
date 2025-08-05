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

    // Additional Whive formats
    if address.len() >= 26 && address.len() <= 62 {
        // Check if it contains valid base58 characters
        let valid_chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let is_valid_base58 = address.chars().all(|c| valid_chars.contains(c));

        if is_valid_base58 {
            // Additional validation for Whive-specific format
            return validate_whive_custom_format(&address);
        }
    }

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

fn validate_whive_custom_format(address: &str) -> Result<bool, AppError> {
    // Basic validation for other Whive address formats
    // This is a simplified check - in production, you'd implement
    // the exact Whive address validation algorithm

    if address.len() < 26 || address.len() > 62 {
        return Ok(false);
    }

    // Check for valid base58 encoding
    match bs58::decode(address).into_vec() {
        Ok(decoded) => {
            // Basic length check
            Ok(decoded.len() >= 20 && decoded.len() <= 40)
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

    // Check for stratum protocol
    if !url.starts_with("stratum+tcp://") && !url.starts_with("stratum+ssl://") {
        return Ok(false);
    }

    // Basic URL parsing
    match url::Url::parse(url) {
        Ok(parsed_url) => {
            // Check if host is present
            if parsed_url.host().is_none() {
                return Ok(false);
            }

            // Check if port is valid
            match parsed_url.port() {
                Some(port) => Ok(port > 0),
                None => Ok(false), // Mining pools typically require explicit ports
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
