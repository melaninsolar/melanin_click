use crate::{log_security, AppError};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::Mutex;
use tracing::{error, info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
    pub severity: ErrorSeverity,
    pub recoverable: bool,
    pub suggested_action: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ErrorSeverity {
    Low,
    Medium,
    High,
    Critical,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ErrorReport {
    pub timestamp: chrono::DateTime<chrono::Utc>,
    pub error: UserError,
    pub context: HashMap<String, String>,
    pub user_id: Option<String>,
    pub session_id: String,
}

pub struct ErrorHandler {
    error_history: Arc<Mutex<Vec<ErrorReport>>>,
    max_history_size: usize,
}

impl ErrorHandler {
    pub fn new(max_history_size: usize) -> Self {
        Self {
            error_history: Arc::new(Mutex::new(Vec::new())),
            max_history_size,
        }
    }

    pub async fn handle_error(
        &self,
        app_error: &AppError,
        context: HashMap<String, String>,
    ) -> UserError {
        let user_error = self.convert_to_user_error(app_error);

        let error_report = ErrorReport {
            timestamp: chrono::Utc::now(),
            error: user_error.clone(),
            context,
            user_id: None, // Could be set from context if auth is implemented
            session_id: uuid::Uuid::new_v4().to_string(),
        };

        // Log the error appropriately
        match user_error.severity {
            ErrorSeverity::Critical => {
                error!(
                    "Critical error: {} - {}",
                    user_error.code, user_error.message
                );
                log_security!(error, "Critical error occurred", "code" => user_error.code);
            }
            ErrorSeverity::High => {
                error!(
                    "High severity error: {} - {}",
                    user_error.code, user_error.message
                );
            }
            ErrorSeverity::Medium => {
                warn!(
                    "Medium severity error: {} - {}",
                    user_error.code, user_error.message
                );
            }
            ErrorSeverity::Low => {
                info!(
                    "Low severity error: {} - {}",
                    user_error.code, user_error.message
                );
            }
        }

        // Store in history (with size limit)
        {
            let mut history = self.error_history.lock().await;
            history.push(error_report);

            if history.len() > self.max_history_size {
                history.remove(0);
            }
        }

        user_error
    }

    fn convert_to_user_error(&self, app_error: &AppError) -> UserError {
        match app_error {
            AppError::Mining(msg) => UserError {
                code: "MINING_ERROR".to_string(),
                message: "Mining operation failed".to_string(),
                details: Some(msg.clone()),
                severity: ErrorSeverity::Medium,
                recoverable: true,
                suggested_action: Some(
                    "Try restarting the mining process or check your mining configuration."
                        .to_string(),
                ),
            },

            AppError::Node(msg) => UserError {
                code: "NODE_ERROR".to_string(),
                message: "Node operation failed".to_string(),
                details: Some(msg.clone()),
                severity: ErrorSeverity::High,
                recoverable: true,
                suggested_action: Some(
                    "Check node configuration and ensure sufficient disk space.".to_string(),
                ),
            },

            AppError::Validation(msg) => UserError {
                code: "VALIDATION_ERROR".to_string(),
                message: "Input validation failed".to_string(),
                details: Some(msg.clone()),
                severity: ErrorSeverity::Low,
                recoverable: true,
                suggested_action: Some("Please check your input and try again.".to_string()),
            },

            AppError::Config(msg) => UserError {
                code: "CONFIG_ERROR".to_string(),
                message: "Configuration error".to_string(),
                details: Some(msg.clone()),
                severity: ErrorSeverity::Critical,
                recoverable: false,
                suggested_action: Some(
                    "Check your .env file and ensure all required environment variables are set."
                        .to_string(),
                ),
            },

            AppError::Process(msg) => UserError {
                code: "PROCESS_ERROR".to_string(),
                message: "Process management failed".to_string(),
                details: Some(msg.clone()),
                severity: ErrorSeverity::High,
                recoverable: true,
                suggested_action: Some(
                    "Try restarting the application or check system resources.".to_string(),
                ),
            },

            AppError::Stratum(msg) => UserError {
                code: "STRATUM_ERROR".to_string(),
                message: "Mining pool connection failed".to_string(),
                details: Some(msg.clone()),
                severity: ErrorSeverity::Medium,
                recoverable: true,
                suggested_action: Some(
                    "Check your internet connection and pool configuration.".to_string(),
                ),
            },

            AppError::Io(io_error) => UserError {
                code: "IO_ERROR".to_string(),
                message: "File system operation failed".to_string(),
                details: Some(io_error.to_string()),
                severity: ErrorSeverity::Medium,
                recoverable: true,
                suggested_action: Some(
                    "Check file permissions and available disk space.".to_string(),
                ),
            },

            AppError::Json(json_error) => UserError {
                code: "JSON_ERROR".to_string(),
                message: "JSON parsing failed".to_string(),
                details: Some(json_error.to_string()),
                severity: ErrorSeverity::Low,
                recoverable: true,
                suggested_action: Some("Check data format and try again.".to_string()),
            },
        }
    }

    pub async fn get_error_history(&self) -> Vec<ErrorReport> {
        let history = self.error_history.lock().await;
        history.clone()
    }

    pub async fn clear_error_history(&self) {
        let mut history = self.error_history.lock().await;
        history.clear();
    }

    pub async fn get_error_statistics(&self) -> HashMap<String, u32> {
        let history = self.error_history.lock().await;
        let mut stats = HashMap::new();

        for report in history.iter() {
            *stats.entry(report.error.code.clone()).or_insert(0) += 1;
        }

        stats
    }
}

// Tauri commands for error handling
#[tauri::command]
pub async fn get_error_history() -> Result<Vec<ErrorReport>, UserError> {
    let handler = get_error_handler();
    Ok(handler.get_error_history().await)
}

#[tauri::command]
pub async fn clear_error_history() -> Result<String, UserError> {
    let handler = get_error_handler();
    handler.clear_error_history().await;
    Ok("Error history cleared".to_string())
}

#[tauri::command]
pub async fn get_error_statistics() -> Result<HashMap<String, u32>, UserError> {
    let handler = get_error_handler();
    Ok(handler.get_error_statistics().await)
}

// Global error handler instance
use std::sync::OnceLock;
static ERROR_HANDLER: OnceLock<ErrorHandler> = OnceLock::new();

pub fn get_error_handler() -> &'static ErrorHandler {
    ERROR_HANDLER.get_or_init(|| ErrorHandler::new(100))
}

pub fn init_error_handler() {
    let _ = get_error_handler();
    info!("Error handler initialized");
}

// Utility functions for common error scenarios
pub async fn handle_mining_error(error: AppError, mining_type: &str) -> UserError {
    let mut context = HashMap::new();
    context.insert("component".to_string(), "mining".to_string());
    context.insert("mining_type".to_string(), mining_type.to_string());

    let handler = get_error_handler();
    handler.handle_error(&error, context).await
}

pub async fn handle_node_error(error: AppError, node_type: &str) -> UserError {
    let mut context = HashMap::new();
    context.insert("component".to_string(), "node".to_string());
    context.insert("node_type".to_string(), node_type.to_string());

    let handler = get_error_handler();
    handler.handle_error(&error, context).await
}

pub async fn handle_validation_error(error: AppError, field: &str) -> UserError {
    let mut context = HashMap::new();
    context.insert("component".to_string(), "validation".to_string());
    context.insert("field".to_string(), field.to_string());

    let handler = get_error_handler();
    handler.handle_error(&error, context).await
}

// Recovery suggestions based on error patterns
pub fn get_recovery_suggestions(error_code: &str) -> Vec<String> {
    match error_code {
        "MINING_ERROR" => vec![
            "Check mining pool connectivity".to_string(),
            "Verify wallet address format".to_string(),
            "Restart mining process".to_string(),
            "Check system resources".to_string(),
        ],
        "NODE_ERROR" => vec![
            "Check disk space availability".to_string(),
            "Verify node configuration".to_string(),
            "Check network connectivity".to_string(),
            "Restart node process".to_string(),
        ],
        "CONFIG_ERROR" => vec![
            "Check .env file exists and is readable".to_string(),
            "Verify all required environment variables are set".to_string(),
            "Check configuration file syntax".to_string(),
            "Reset to default configuration".to_string(),
        ],
        "STRATUM_ERROR" => vec![
            "Check internet connection".to_string(),
            "Verify mining pool URL and port".to_string(),
            "Try different mining pool".to_string(),
            "Check firewall settings".to_string(),
        ],
        _ => vec![
            "Restart the application".to_string(),
            "Check system logs".to_string(),
            "Contact support if problem persists".to_string(),
        ],
    }
}
