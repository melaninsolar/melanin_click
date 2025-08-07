use crate::AppError;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::net::TcpStream;
use tokio::sync::{mpsc, Mutex};
use tokio::time::{timeout, Duration};
use tracing::{debug, error, info, warn};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StratumJob {
    pub job_id: String,
    pub previous_hash: String,
    pub coinbase1: String,
    pub coinbase2: String,
    pub merkle_branches: Vec<String>,
    pub version: String,
    pub nbits: String,
    pub ntime: String,
    pub clean_jobs: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StratumStats {
    pub connected: bool,
    pub pool_url: String,
    pub worker_name: String,
    pub difficulty: f64,
    pub accepted_shares: u64,
    pub rejected_shares: u64,
    pub last_share_time: Option<chrono::DateTime<chrono::Utc>>,
    pub connection_time: chrono::DateTime<chrono::Utc>,
    pub ping: Option<u64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StratumMessage {
    pub id: Option<u64>,
    pub method: Option<String>,
    pub params: Option<Value>,
    pub result: Option<Value>,
    pub error: Option<Value>,
}

pub struct StratumClient {
    pool_url: String,
    pool_port: u16,
    username: String,
    password: String,
    stream: Arc<Mutex<Option<TcpStream>>>,
    stats: Arc<Mutex<StratumStats>>,
    message_id: AtomicU64,
    job_receiver: Arc<Mutex<Option<mpsc::Receiver<StratumJob>>>>,
    job_sender: mpsc::Sender<StratumJob>,
    shutdown_sender: mpsc::Sender<()>,
    shutdown_receiver: Arc<Mutex<Option<mpsc::Receiver<()>>>>,
}

impl StratumClient {
    pub fn new(pool_url: &str, pool_port: u16, username: &str, password: &str) -> Self {
        let (job_sender, job_receiver) = mpsc::channel(100);
        let (shutdown_sender, shutdown_receiver) = mpsc::channel(1);

        let stats = StratumStats {
            connected: false,
            pool_url: pool_url.to_string(),
            worker_name: username.to_string(),
            difficulty: 1.0,
            accepted_shares: 0,
            rejected_shares: 0,
            last_share_time: None,
            connection_time: chrono::Utc::now(),
            ping: None,
        };

        Self {
            pool_url: pool_url.to_string(),
            pool_port,
            username: username.to_string(),
            password: password.to_string(),
            stream: Arc::new(Mutex::new(None)),
            stats: Arc::new(Mutex::new(stats)),
            message_id: AtomicU64::new(1),
            job_receiver: Arc::new(Mutex::new(Some(job_receiver))),
            job_sender,
            shutdown_sender,
            shutdown_receiver: Arc::new(Mutex::new(Some(shutdown_receiver))),
        }
    }

    pub async fn connect(&self) -> Result<(), AppError> {
        info!(
            "Connecting to Stratum pool: {}:{}",
            self.pool_url, self.pool_port
        );

        let address = format!("{}:{}", self.pool_url, self.pool_port);
        let tcp_stream = timeout(Duration::from_secs(10), TcpStream::connect(&address))
            .await
            .map_err(|_| AppError::Stratum("Connection timeout".to_string()))?
            .map_err(|e| AppError::Stratum(format!("Failed to connect: {}", e)))?;

        {
            let mut stream = self.stream.lock().await;
            *stream = Some(tcp_stream);
        }

        {
            let mut stats = self.stats.lock().await;
            stats.connected = true;
            stats.connection_time = chrono::Utc::now();
        }

        info!("Connected to Stratum pool successfully: {}", self.pool_url);

        // Start the message handling loop
        self.start_message_loop().await?;

        // Send subscription and authorization
        self.subscribe().await?;
        self.authorize().await?;

        Ok(())
    }

    async fn start_message_loop(&self) -> Result<(), AppError> {
        let stream_clone = Arc::clone(&self.stream);
        let stats_clone = Arc::clone(&self.stats);
        let job_sender = self.job_sender.clone();
        let mut shutdown_receiver = {
            let mut receiver_guard = self.shutdown_receiver.lock().await;
            receiver_guard
                .take()
                .ok_or_else(|| AppError::Stratum("Shutdown receiver already taken".to_string()))?
        };

        tokio::spawn(async move {
            let mut stream_guard = stream_clone.lock().await;
            if let Some(ref mut stream) = *stream_guard {
                let (reader, _writer) = stream.split();
                let mut buf_reader = BufReader::new(reader);
                let mut line = String::new();

                loop {
                    tokio::select! {
                        result = buf_reader.read_line(&mut line) => {
                            match result {
                                Ok(0) => {
                                    warn!("Connection closed by pool");
                                    break;
                                }
                                Ok(_) => {
                                    if let Err(e) = Self::handle_message(&line, &stats_clone, &job_sender).await {
                                        error!("Error handling message: {}", e);
                                    }
                                    line.clear();
                                }
                                Err(e) => {
                                    error!("Error reading from stream: {}", e);
                                    break;
                                }
                            }
                        }
                        _ = shutdown_receiver.recv() => {
                            info!("Received shutdown signal");
                            break;
                        }
                    }
                }

                // Update connection status
                let mut stats = stats_clone.lock().await;
                stats.connected = false;
            }
        });

        Ok(())
    }

    async fn handle_message(
        line: &str,
        stats: &Arc<Mutex<StratumStats>>,
        job_sender: &mpsc::Sender<StratumJob>,
    ) -> Result<(), AppError> {
        let line = line.trim();
        if line.is_empty() {
            return Ok(());
        }

        debug!("Received message: {}", line);

        let message: StratumMessage = serde_json::from_str(line)
            .map_err(|e| AppError::Stratum(format!("Failed to parse message: {}", e)))?;

        if let Some(method) = &message.method {
            match method.as_str() {
                "mining.notify" => {
                    if let Some(params) = &message.params {
                        if let Some(params_array) = params.as_array() {
                            if params_array.len() >= 9 {
                                let job = StratumJob {
                                    job_id: params_array[0].as_str().unwrap_or("").to_string(),
                                    previous_hash: params_array[1]
                                        .as_str()
                                        .unwrap_or("")
                                        .to_string(),
                                    coinbase1: params_array[2].as_str().unwrap_or("").to_string(),
                                    coinbase2: params_array[3].as_str().unwrap_or("").to_string(),
                                    merkle_branches: params_array[4]
                                        .as_array()
                                        .unwrap_or(&vec![])
                                        .iter()
                                        .filter_map(|v| v.as_str().map(|s| s.to_string()))
                                        .collect(),
                                    version: params_array[5].as_str().unwrap_or("").to_string(),
                                    nbits: params_array[6].as_str().unwrap_or("").to_string(),
                                    ntime: params_array[7].as_str().unwrap_or("").to_string(),
                                    clean_jobs: params_array[8].as_bool().unwrap_or(false),
                                };

                                info!("Received new mining job: {}", job.job_id);

                                if let Err(e) = job_sender.send(job).await {
                                    error!("Failed to send job: {}", e);
                                }
                            }
                        }
                    }
                }
                "mining.set_difficulty" => {
                    if let Some(params) = &message.params {
                        if let Some(params_array) = params.as_array() {
                            if let Some(difficulty) = params_array.first().and_then(|v| v.as_f64())
                            {
                                let mut stats_guard = stats.lock().await;
                                stats_guard.difficulty = difficulty;
                                info!("Difficulty updated: {}", difficulty);
                            }
                        }
                    }
                }
                _ => {
                    debug!("Unhandled method: {}", method);
                }
            }
        } else if let Some(result) = &message.result {
            // Handle responses to our requests
            if result.as_bool() == Some(true) {
                debug!("Request successful: {}", message.id.unwrap_or(0));
            } else {
                warn!("Request failed: {}", result);
            }
        } else if let Some(error) = &message.error {
            error!("Received error: {}", error);
        }

        Ok(())
    }

    async fn send_message(&self, message: Value) -> Result<(), AppError> {
        let message_str = format!("{}\n", serde_json::to_string(&message)?);
        debug!("Sending message: {}", message_str.trim());

        let mut stream_guard = self.stream.lock().await;
        if let Some(ref mut stream) = *stream_guard {
            stream
                .write_all(message_str.as_bytes())
                .await
                .map_err(|e| AppError::Stratum(format!("Failed to send message: {}", e)))?;
            stream
                .flush()
                .await
                .map_err(|e| AppError::Stratum(format!("Failed to flush stream: {}", e)))?;
        } else {
            return Err(AppError::Stratum("Not connected".to_string()));
        }

        Ok(())
    }

    async fn subscribe(&self) -> Result<(), AppError> {
        let id = self.message_id.fetch_add(1, Ordering::SeqCst);
        let message = json!({
            "id": id,
            "method": "mining.subscribe",
            "params": ["Melanin Click Miner", null]
        });

        self.send_message(message).await
    }

    async fn authorize(&self) -> Result<(), AppError> {
        let id = self.message_id.fetch_add(1, Ordering::SeqCst);
        let message = json!({
            "id": id,
            "method": "mining.authorize",
            "params": [self.username, self.password]
        });

        self.send_message(message).await
    }

    pub async fn submit_share(
        &self,
        job_id: &str,
        extranonce2: &str,
        ntime: &str,
        nonce: &str,
    ) -> Result<(), AppError> {
        let id = self.message_id.fetch_add(1, Ordering::SeqCst);
        let message = json!({
            "id": id,
            "method": "mining.submit",
            "params": [self.username, job_id, extranonce2, ntime, nonce]
        });

        info!("Submitting share: job_id={}, nonce={}", job_id, nonce);
        self.send_message(message).await?;

        // Update statistics
        let mut stats = self.stats.lock().await;
        stats.accepted_shares += 1;
        stats.last_share_time = Some(chrono::Utc::now());

        Ok(())
    }

    pub async fn get_stats(&self) -> StratumStats {
        let stats = self.stats.lock().await;
        stats.clone()
    }

    pub async fn get_next_job(&self) -> Option<StratumJob> {
        let mut receiver_guard = self.job_receiver.lock().await;
        if let Some(ref mut receiver) = *receiver_guard {
            receiver.recv().await
        } else {
            None
        }
    }

    pub async fn disconnect(&self) -> Result<(), AppError> {
        info!("Disconnecting from Stratum pool");

        // Send shutdown signal
        if let Err(e) = self.shutdown_sender.send(()).await {
            warn!("Failed to send shutdown signal: {}", e);
        }

        // Close the stream
        let mut stream_guard = self.stream.lock().await;
        if let Some(stream) = stream_guard.take() {
            drop(stream);
        }

        // Update connection status
        let mut stats = self.stats.lock().await;
        stats.connected = false;

        info!("Disconnected from Stratum pool");
        Ok(())
    }

    pub async fn is_connected(&self) -> bool {
        let stats = self.stats.lock().await;
        stats.connected
    }
}

// Utility functions for Stratum protocol
impl StratumMessage {
    #[allow(dead_code)]
    fn from_json_str(s: &str) -> Result<Self, AppError> {
        let value: Value = serde_json::from_str(s)
            .map_err(|e| AppError::Stratum(format!("Invalid JSON: {}", e)))?;

        Ok(StratumMessage {
            id: value.get("id").and_then(|v| v.as_u64()),
            method: value
                .get("method")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string()),
            params: value.get("params").cloned(),
            result: value.get("result").cloned(),
            error: value.get("error").cloned(),
        })
    }
}

// Parse pool URL from stratum+tcp://host:port format
pub fn parse_stratum_url(url: &str) -> Result<(String, u16), AppError> {
    let url = url
        .strip_prefix("stratum+tcp://")
        .or_else(|| url.strip_prefix("stratum+ssl://"))
        .ok_or_else(|| AppError::Stratum("Invalid stratum URL format".to_string()))?;

    let parts: Vec<&str> = url.split(':').collect();
    if parts.len() != 2 {
        return Err(AppError::Stratum(
            "Invalid URL format - expected host:port".to_string(),
        ));
    }

    let host = parts[0].to_string();
    let port = parts[1]
        .parse::<u16>()
        .map_err(|_| AppError::Stratum("Invalid port number".to_string()))?;

    Ok((host, port))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_stratum_url() {
        assert_eq!(
            parse_stratum_url("stratum+tcp://pool.example.com:3333").unwrap(),
            ("pool.example.com".to_string(), 3333)
        );

        assert_eq!(
            parse_stratum_url("stratum+ssl://secure.pool.com:4444").unwrap(),
            ("secure.pool.com".to_string(), 4444)
        );

        assert!(parse_stratum_url("invalid://url").is_err());
        assert!(parse_stratum_url("stratum+tcp://pool.com").is_err());
    }
}
