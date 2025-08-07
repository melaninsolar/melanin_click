use crate::AppError;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub bitcoin_rpc_user: String,
    pub bitcoin_rpc_password: String,
    pub bitcoin_rpc_host: String,
    pub bitcoin_rpc_port: u16,
    pub whive_rpc_user: String,
    pub whive_rpc_password: String,
    pub whive_rpc_host: String,
    pub whive_rpc_port: u16,
    pub default_mining_threads: u32,
    pub max_mining_threads: u32,
    pub mining_intensity: u8,
    pub app_secret_key: String,
    pub session_timeout: u64,
    pub log_level: String,
    pub log_file_path: String,
    pub max_log_size_mb: u64,
    pub network_timeout_seconds: u64,
    pub max_retry_attempts: u32,
    pub debug_mode: bool,
    pub enable_telemetry: bool,
    pub auto_update_check: bool,
}

impl AppConfig {
    pub fn from_env() -> Result<Self, AppError> {
        // Load .env file if it exists
        if let Ok(env_path) = std::env::current_dir() {
            let env_file = env_path.join(".env");
            if env_file.exists() {
                match dotenv::from_path(&env_file) {
                    Ok(_) => println!("Loaded environment from .env file"),
                    Err(e) => println!("Warning: Could not load .env file: {e}"),
                }
            }
        }

        let config = AppConfig {
            // Bitcoin RPC Configuration
            bitcoin_rpc_user: env::var("BITCOIN_RPC_USER")
                .unwrap_or_else(|_| "melanin_rpc_user".to_string()),
            bitcoin_rpc_password: env::var("BITCOIN_RPC_PASSWORD")
                .unwrap_or_else(|_| "default_mobile_password".to_string()),
            bitcoin_rpc_host: env::var("BITCOIN_RPC_HOST")
                .unwrap_or_else(|_| "127.0.0.1".to_string()),
            bitcoin_rpc_port: env::var("BITCOIN_RPC_PORT")
                .unwrap_or_else(|_| "8332".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid BITCOIN_RPC_PORT".to_string()))?,

            // Whive RPC Configuration
            whive_rpc_user: env::var("WHIVE_RPC_USER")
                .unwrap_or_else(|_| "whive_rpc_user".to_string()),
            whive_rpc_password: env::var("WHIVE_RPC_PASSWORD")
                .unwrap_or_else(|_| "default_whive_password".to_string()),
            whive_rpc_host: env::var("WHIVE_RPC_HOST").unwrap_or_else(|_| "127.0.0.1".to_string()),
            whive_rpc_port: env::var("WHIVE_RPC_PORT")
                .unwrap_or_else(|_| "9332".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid WHIVE_RPC_PORT".to_string()))?,

            // Mining Configuration
            default_mining_threads: env::var("DEFAULT_MINING_THREADS")
                .unwrap_or_else(|_| "2".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid DEFAULT_MINING_THREADS".to_string()))?,
            max_mining_threads: env::var("MAX_MINING_THREADS")
                .unwrap_or_else(|_| "8".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid MAX_MINING_THREADS".to_string()))?,
            mining_intensity: env::var("MINING_INTENSITY")
                .unwrap_or_else(|_| "85".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid MINING_INTENSITY".to_string()))?,

            // Security Configuration
            app_secret_key: env::var("APP_SECRET_KEY")
                .unwrap_or_else(|_| "default_mobile_secret_key_32_chars".to_string()),
            session_timeout: env::var("SESSION_TIMEOUT")
                .unwrap_or_else(|_| "3600".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid SESSION_TIMEOUT".to_string()))?,

            // Logging Configuration
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            log_file_path: env::var("LOG_FILE_PATH")
                .unwrap_or_else(|_| "logs/melanin_click.log".to_string()),
            max_log_size_mb: env::var("MAX_LOG_SIZE_MB")
                .unwrap_or_else(|_| "50".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid MAX_LOG_SIZE_MB".to_string()))?,

            // Network Configuration
            network_timeout_seconds: env::var("NETWORK_TIMEOUT_SECONDS")
                .unwrap_or_else(|_| "30".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid NETWORK_TIMEOUT_SECONDS".to_string()))?,
            max_retry_attempts: env::var("MAX_RETRY_ATTEMPTS")
                .unwrap_or_else(|_| "3".to_string())
                .parse()
                .map_err(|_| AppError::Config("Invalid MAX_RETRY_ATTEMPTS".to_string()))?,

            // Development Settings
            debug_mode: env::var("DEBUG_MODE")
                .unwrap_or_else(|_| "false".to_string())
                .parse()
                .unwrap_or(false),
            enable_telemetry: env::var("ENABLE_TELEMETRY")
                .unwrap_or_else(|_| "false".to_string())
                .parse()
                .unwrap_or(false),
            auto_update_check: env::var("AUTO_UPDATE_CHECK")
                .unwrap_or_else(|_| "true".to_string())
                .parse()
                .unwrap_or(true),
        };

        // Validate configuration
        config.validate()?;

        Ok(config)
    }

    fn validate(&self) -> Result<(), AppError> {
        // Validate secret key length
        if self.app_secret_key.len() < 32 {
            return Err(AppError::Config(
                "APP_SECRET_KEY must be at least 32 characters long".to_string(),
            ));
        }

        // Validate password strength
        if self.bitcoin_rpc_password.len() < 16 {
            return Err(AppError::Config(
                "BITCOIN_RPC_PASSWORD must be at least 16 characters long".to_string(),
            ));
        }

        if self.whive_rpc_password.len() < 16 {
            return Err(AppError::Config(
                "WHIVE_RPC_PASSWORD must be at least 16 characters long".to_string(),
            ));
        }

        // Validate mining thread limits
        if self.default_mining_threads > self.max_mining_threads {
            return Err(AppError::Config(
                "DEFAULT_MINING_THREADS cannot exceed MAX_MINING_THREADS".to_string(),
            ));
        }

        if self.mining_intensity > 100 {
            return Err(AppError::Config(
                "MINING_INTENSITY must be between 0 and 100".to_string(),
            ));
        }

        // Validate log level
        let valid_log_levels = ["error", "warn", "info", "debug", "trace"];
        if !valid_log_levels.contains(&self.log_level.as_str()) {
            return Err(AppError::Config(format!(
                "Invalid LOG_LEVEL '{}'. Must be one of: {:?}",
                self.log_level, valid_log_levels
            )));
        }

        Ok(())
    }

    pub fn get_bitcoin_rpc_url(&self) -> String {
        format!("http://{}:{}", self.bitcoin_rpc_host, self.bitcoin_rpc_port)
    }

    pub fn get_whive_rpc_url(&self) -> String {
        format!("http://{}:{}", self.whive_rpc_host, self.whive_rpc_port)
    }
}

// Global configuration instance
use std::sync::OnceLock;
static CONFIG: OnceLock<AppConfig> = OnceLock::new();

pub fn get_config() -> &'static AppConfig {
    CONFIG.get_or_init(|| AppConfig::from_env().expect("Failed to load application configuration"))
}

pub fn init_config() -> Result<(), AppError> {
    let config = AppConfig::from_env()?;
    CONFIG
        .set(config)
        .map_err(|_| AppError::Config("Configuration already initialized".to_string()))?;
    Ok(())
}
