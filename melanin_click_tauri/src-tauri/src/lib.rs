use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::sync::Mutex;

// Core error handling
#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Mining error: {0}")]
    Mining(String),
    #[error("Node error: {0}")]
    Node(String),
    #[error("Validation error: {0}")]
    Validation(String),
    #[error("Configuration error: {0}")]
    Config(String),
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    #[error("Process error: {0}")]
    Process(String),
    #[error("Stratum error: {0}")]
    Stratum(String),
    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),
}

impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

// Application state
#[derive(Debug, Default)]
pub struct AppState {
    pub downloads: Mutex<HashMap<String, DownloadProgress>>,
    pub processes: Mutex<HashMap<String, u32>>,
    pub mining_stats: Mutex<HashMap<String, MiningStats>>,
    pub system_info: Mutex<Option<SystemInfo>>,
}

// Data structures
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub total_size: u64,
    pub downloaded: u64,
    pub speed: f64,
    pub status: String,
    pub url: String,
    pub started_at: chrono::DateTime<chrono::Utc>,
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
    pub pool_url: String,
    pub algorithm: String,
    pub threads: u32,
    pub last_update: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemInfo {
    pub platform: String,
    pub arch: String,
    pub total_memory: u64,
    pub available_memory: u64,
    pub disk_space: u64,
    pub available_disk_space: u64,
    pub cpu_cores: usize,
    pub cpu_threads: usize,
    pub cpu_brand: String,
    pub cpu_frequency: u64,
    pub gpu_devices: Vec<GpuDevice>,
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
pub struct MiningConfig {
    pub pool_url: String,
    pub wallet_address: String,
    pub worker_name: String,
    pub mining_intensity: u8,
    pub threads: u32,
    pub algorithm: String,
    pub auto_start: bool,
    pub hardware_selection: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NodeStatus {
    pub is_running: bool,
    pub sync_progress: f64,
    pub block_height: u64,
    pub peer_count: u32,
    pub network: String,
    pub data_dir: String,
    pub config_path: String,
}

// Declare modules
pub mod android_lifecycle;
pub mod config;
pub mod core;
pub mod error_handler;
pub mod logging;
pub mod mining;
pub mod mining_stats;
pub mod mobile;
pub mod monitoring;
pub mod node;
pub mod solo_mining;
pub mod stratum;
pub mod utils;
pub mod validation;

pub fn run() {
    // Initialize configuration and logging early
    config::init_config().expect("Failed to initialize configuration");
    logging::init_logging().expect("Failed to initialize logging");
    error_handler::init_error_handler();
    logging::log_system_startup();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .manage(AppState::default())
        .manage(mobile::MobileManager::new())
        .manage(solo_mining::SoloMiner::new())
        .manage(android_lifecycle::AndroidLifecycleManager::new())
        .setup(|_app| {
            // Perform additional setup here
            tracing::info!("Tauri application setup complete");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Mining commands
            mining::download_and_install_miners,
            mining::start_simple_whive_mining,
            mining::start_simple_bitcoin_mining,
            mining::test_simple_mining,
            mining::start_enhanced_whive_mining,
            mining::start_enhanced_bitcoin_mining,
            mining::stop_mining,
            mining::get_mining_status,
            mining::update_mining_config,
            mining::get_mining_pools,
            // Node commands with enhanced functionality
            node::download_and_install_bitcoin,
            node::download_and_install_whive,
            node::run_bitcoin_mainnet,
            node::run_bitcoin_pruned,
            node::run_whive_node,
            node::stop_node,
            node::get_node_status,
            // Monitoring commands
            monitoring::get_real_mining_stats,
            monitoring::get_system_info,
            monitoring::get_hardware_info,
            monitoring::benchmark_hardware,
            // Validation commands
            validation::validate_bitcoin_address,
            validation::validate_whive_address,
            validation::verify_file_hash,
            // Utility commands
            utils::get_download_progress,
            utils::check_file_exists,
            utils::create_directory,
            utils::get_file_size,
            // Error handling commands
            error_handler::get_error_history,
            error_handler::clear_error_history,
            error_handler::get_error_statistics,
            // Mobile commands
            mobile::get_battery_status,
            mobile::update_mobile_settings,
            mobile::get_mobile_settings,
            mobile::is_mobile_mining_allowed,
            // Solo mining commands
            solo_mining::configure_solo_mining,
            solo_mining::start_solo_mining,
            solo_mining::stop_solo_mining,
            solo_mining::get_solo_mining_stats,
            solo_mining::get_solo_block_template,
            // Android lifecycle commands
            android_lifecycle::android_app_resume,
            android_lifecycle::android_app_pause,
            android_lifecycle::start_foreground_mining_service,
            android_lifecycle::stop_foreground_mining_service,
            android_lifecycle::request_disable_battery_optimization,
            android_lifecycle::set_background_mining_enabled,
            android_lifecycle::get_android_lifecycle_state,
            android_lifecycle::update_mining_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
