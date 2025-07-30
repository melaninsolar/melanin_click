use crate::config::get_config;
use crate::AppError;
use std::fs;
use std::path::PathBuf;
use tracing::Level;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

pub fn init_logging() -> Result<(), AppError> {
    let config = get_config();

    // Create logs directory if it doesn't exist
    let log_path = PathBuf::from(&config.log_file_path);
    if let Some(parent) = log_path.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| AppError::Config(format!("Failed to create log directory: {}", e)))?;
    }

    // Configure log level based on environment
    let log_level = match config.log_level.to_lowercase().as_str() {
        "error" => Level::ERROR,
        "warn" => Level::WARN,
        "info" => Level::INFO,
        "debug" => Level::DEBUG,
        "trace" => Level::TRACE,
        _ => Level::INFO,
    };

    // Create environment filter
    let env_filter = EnvFilter::builder()
        .with_default_directive(log_level.into())
        .from_env_lossy();

    // Configure file logging
    let file_appender = tracing_appender::rolling::never(
        log_path.parent().unwrap_or(&PathBuf::from("logs")),
        log_path
            .file_name()
            .unwrap_or(std::ffi::OsStr::new("melanin_click.log")),
    );

    let (file_writer, _file_guard) = tracing_appender::non_blocking(file_appender);

    // Configure console and file layers
    let console_layer = fmt::layer()
        .with_target(false)
        .with_thread_ids(true)
        .with_file(config.debug_mode)
        .with_line_number(config.debug_mode);

    let file_layer = fmt::layer()
        .with_writer(file_writer)
        .with_target(true)
        .with_thread_ids(true)
        .with_file(true)
        .with_line_number(true)
        .json();

    // Initialize the tracing subscriber
    tracing_subscriber::registry()
        .with(env_filter)
        .with(console_layer)
        .with(file_layer)
        .init();

    tracing::info!(
        "Logging initialized - level: {}, file: {}",
        config.log_level,
        config.log_file_path
    );

    // Log configuration details in debug mode
    if config.debug_mode {
        tracing::debug!("Application started in debug mode");
        tracing::debug!("Configuration loaded successfully");
    }

    Ok(())
}

// Log rotation and management
pub async fn rotate_logs_if_needed() -> Result<(), AppError> {
    let config = get_config();
    let log_path = PathBuf::from(&config.log_file_path);

    if !log_path.exists() {
        return Ok(());
    }

    let metadata = fs::metadata(&log_path)
        .map_err(|e| AppError::Config(format!("Failed to get log file metadata: {}", e)))?;

    let file_size_mb = metadata.len() / (1024 * 1024);

    if file_size_mb > config.max_log_size_mb {
        let backup_path = log_path.with_extension("log.old");
        fs::rename(&log_path, &backup_path)
            .map_err(|e| AppError::Config(format!("Failed to rotate log file: {}", e)))?;

        tracing::info!("Log file rotated - old file moved to {:?}", backup_path);
    }

    Ok(())
}

// Structured logging macros for different components
#[macro_export]
macro_rules! log_mining {
    ($level:ident, $msg:expr, $($key:expr => $value:expr),*) => {
        tracing::$level!(
            component = "mining",
            $($key = %$value,)*
            "{}", $msg
        );
    };
    ($level:ident, $msg:expr) => {
        tracing::$level!(
            component = "mining",
            "{}", $msg
        );
    };
}

#[macro_export]
macro_rules! log_node {
    ($level:ident, $msg:expr, $($key:expr => $value:expr),*) => {
        tracing::$level!(
            component = "node",
            $($key = %$value,)*
            "{}", $msg
        );
    };
    ($level:ident, $msg:expr) => {
        tracing::$level!(
            component = "node",
            "{}", $msg
        );
    };
}

#[macro_export]
macro_rules! log_stratum {
    ($level:ident, $msg:expr, $($key:expr => $value:expr),*) => {
        tracing::$level!(
            component = "stratum",
            $($key = %$value,)*
            "{}", $msg
        );
    };
    ($level:ident, $msg:expr) => {
        tracing::$level!(
            component = "stratum",
            "{}", $msg
        );
    };
}

#[macro_export]
macro_rules! log_security {
    ($level:ident, $msg:expr, $($key:expr => $value:expr),*) => {
        tracing::$level!(
            component = "security",
            $($key = %$value,)*
            "{}", $msg
        );
    };
    ($level:ident, $msg:expr) => {
        tracing::$level!(
            component = "security",
            "{}", $msg
        );
    };
}

// Performance monitoring
pub struct PerformanceTimer {
    name: String,
    start: std::time::Instant,
}

impl PerformanceTimer {
    pub fn new(name: &str) -> Self {
        Self {
            name: name.to_string(),
            start: std::time::Instant::now(),
        }
    }
}

impl Drop for PerformanceTimer {
    fn drop(&mut self) {
        let duration = self.start.elapsed();
        tracing::debug!(
            component = "performance",
            operation = %self.name,
            duration_ms = duration.as_millis(),
            "Operation completed"
        );
    }
}

#[macro_export]
macro_rules! time_operation {
    ($name:expr, $block:block) => {{
        let _timer = $crate::logging::PerformanceTimer::new($name);
        $block
    }};
}

// System event logging
pub fn log_system_startup() {
    tracing::info!(
        component = "system",
        event = "startup",
        version = env!("CARGO_PKG_VERSION"),
        platform = std::env::consts::OS,
        arch = std::env::consts::ARCH,
        "Melanin Click application starting"
    );
}

pub fn log_system_shutdown() {
    tracing::info!(
        component = "system",
        event = "shutdown",
        "Melanin Click application shutting down"
    );
}

pub fn log_security_event(event_type: &str, details: &str) {
    tracing::warn!(
        component = "security",
        event_type = event_type,
        details = details,
        "Security event detected"
    );
}
