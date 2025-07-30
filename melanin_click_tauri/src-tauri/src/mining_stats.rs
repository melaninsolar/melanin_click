use crate::AppError;
use chrono::{DateTime, Utc};
use std::collections::HashMap;
use std::sync::Arc;
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Child;
use tokio::sync::Mutex;

#[derive(Debug, Clone)]
pub struct RealMiningStats {
    pub hashrate: f64,
    pub accepted_shares: u32,
    pub rejected_shares: u32,
    pub temperature: f64,
    pub power_consumption: f64,
    pub uptime: u64,
    pub pool_difficulty: f64,
    pub estimated_earnings: f64,
    pub last_share_time: Option<DateTime<Utc>>,
    pub total_hashes: u64,
    pub error_count: u32,
}

impl Default for RealMiningStats {
    fn default() -> Self {
        Self {
            hashrate: 0.0,
            accepted_shares: 0,
            rejected_shares: 0,
            temperature: 0.0,
            power_consumption: 0.0,
            uptime: 0,
            pool_difficulty: 0.0,
            estimated_earnings: 0.0,
            last_share_time: None,
            total_hashes: 0,
            error_count: 0,
        }
    }
}

pub struct MiningStatsCollector {
    stats: Arc<Mutex<HashMap<String, RealMiningStats>>>,
    processes: Arc<Mutex<HashMap<String, Child>>>,
}

impl MiningStatsCollector {
    pub fn new() -> Self {
        Self {
            stats: Arc::new(Mutex::new(HashMap::new())),
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn start_monitoring_process(
        &self,
        mining_type: &str,
        mut child: Child,
    ) -> Result<(), AppError> {
        let stats = Arc::clone(&self.stats);
        let mining_type = mining_type.to_string();

        // Initialize stats
        {
            let mut stats_map = stats.lock().await;
            stats_map.insert(mining_type.clone(), RealMiningStats::default());
        }

        // Take stdout before moving child
        let stdout = child.stdout.take();

        // Store the process
        {
            let mut processes = self.processes.lock().await;
            processes.insert(mining_type.clone(), child);
        }

        // Spawn task to monitor output
        let stats_clone = Arc::clone(&stats);
        let mining_type_clone = mining_type.clone();

        tokio::spawn(async move {
            if let Some(stdout) = stdout {
                let reader = BufReader::new(stdout);
                let mut lines = reader.lines();

                while let Ok(Some(line)) = lines.next_line().await {
                    if let Err(e) =
                        Self::parse_mining_output(&stats_clone, &mining_type_clone, &line).await
                    {
                        eprintln!("Error parsing mining output: {}", e);
                    }
                }
            }
        });

        Ok(())
    }

    async fn parse_mining_output(
        stats: &Arc<Mutex<HashMap<String, RealMiningStats>>>,
        mining_type: &str,
        line: &str,
    ) -> Result<(), AppError> {
        let mut stats_map = stats.lock().await;
        let current_stats = stats_map
            .entry(mining_type.to_string())
            .or_insert_with(RealMiningStats::default);

        // Parse different mining output formats
        if mining_type == "whive" {
            Self::parse_whive_output(current_stats, line);
        } else if mining_type == "bitcoin" {
            Self::parse_bitcoin_output(current_stats, line);
        }

        Ok(())
    }

    fn parse_whive_output(stats: &mut RealMiningStats, line: &str) {
        // Parse cpuminer/minerd output for Whive (Yespower)
        // Example outputs:
        // "[2024-01-01 12:00:00] accepted: 1/1 (100.00%), 450.12 H/s yes!"
        // "[2024-01-01 12:00:00] CPU #0: 112.53 H/s"
        // "[2024-01-01 12:00:00] stratum_recv_line failed"

        if line.contains("accepted:") {
            // Parse accepted shares
            if let Some(accepted_part) = line.split("accepted: ").nth(1) {
                if let Some(shares_part) = accepted_part.split('/').next() {
                    if let Ok(accepted) = shares_part.parse::<u32>() {
                        stats.accepted_shares = accepted;
                        stats.last_share_time = Some(Utc::now());
                    }
                }
            }

            // Parse hashrate from accepted line
            if let Some(hashrate_part) = line.split(", ").nth(1) {
                if let Some(rate_str) = hashrate_part.split(' ').next() {
                    if let Ok(rate) = rate_str.parse::<f64>() {
                        stats.hashrate = rate;
                    }
                }
            }
        } else if line.contains("H/s") && line.contains("CPU #") {
            // Parse individual CPU thread hashrate
            if let Some(rate_part) = line.split(": ").nth(1) {
                if let Some(rate_str) = rate_part.split(' ').next() {
                    if let Ok(rate) = rate_str.parse::<f64>() {
                        // This is per-thread, we might want to sum them
                        stats.hashrate = rate; // For now, just use the last one
                    }
                }
            }
        } else if line.contains("failed") || line.contains("error") {
            stats.error_count += 1;
        }
    }

    fn parse_bitcoin_output(stats: &mut RealMiningStats, line: &str) {
        // Parse cpuminer output for Bitcoin (SHA-256d)
        // Example outputs:
        // "[2024-01-01 12:00:00] accepted: 1/1 (100.00%), 25.12 kH/s yes!"
        // "[2024-01-01 12:00:00] CPU #0: 6.25 kH/s"
        // "[2024-01-01 12:00:00] stratum_recv_line failed"

        if line.contains("accepted:") {
            // Parse accepted shares
            if let Some(accepted_part) = line.split("accepted: ").nth(1) {
                if let Some(shares_part) = accepted_part.split('/').next() {
                    if let Ok(accepted) = shares_part.parse::<u32>() {
                        stats.accepted_shares = accepted;
                        stats.last_share_time = Some(Utc::now());
                    }
                }
            }

            // Parse hashrate (handle kH/s, MH/s, etc.)
            if let Some(hashrate_part) = line.split(", ").nth(1) {
                if let Some(rate_str) = hashrate_part.split(' ').next() {
                    if let Ok(rate) = rate_str.parse::<f64>() {
                        // Convert to H/s
                        if line.contains("kH/s") {
                            stats.hashrate = rate * 1000.0;
                        } else if line.contains("MH/s") {
                            stats.hashrate = rate * 1_000_000.0;
                        } else if line.contains("GH/s") {
                            stats.hashrate = rate * 1_000_000_000.0;
                        } else {
                            stats.hashrate = rate;
                        }
                    }
                }
            }
        } else if line.contains("H/s") && line.contains("CPU #") {
            // Parse individual CPU thread hashrate
            if let Some(rate_part) = line.split(": ").nth(1) {
                if let Some(rate_str) = rate_part.split(' ').next() {
                    if let Ok(rate) = rate_str.parse::<f64>() {
                        // Convert to H/s based on unit
                        let hashrate = if line.contains("kH/s") {
                            rate * 1000.0
                        } else if line.contains("MH/s") {
                            rate * 1_000_000.0
                        } else {
                            rate
                        };
                        stats.hashrate = hashrate;
                    }
                }
            }
        } else if line.contains("failed") || line.contains("error") {
            stats.error_count += 1;
        }
    }

    pub async fn get_stats(&self, mining_type: &str) -> Option<RealMiningStats> {
        let stats_map = self.stats.lock().await;
        stats_map.get(mining_type).cloned()
    }

    pub async fn stop_monitoring(&self, mining_type: &str) -> Result<(), AppError> {
        // Stop the process
        {
            let mut processes = self.processes.lock().await;
            if let Some(mut child) = processes.remove(mining_type) {
                let _ = child.kill().await;
            }
        }

        // Remove stats
        {
            let mut stats_map = self.stats.lock().await;
            stats_map.remove(mining_type);
        }

        Ok(())
    }

    pub async fn update_temperature(&self, mining_type: &str, temp: f64) {
        let mut stats_map = self.stats.lock().await;
        if let Some(stats) = stats_map.get_mut(mining_type) {
            stats.temperature = temp;
        }
    }

    pub async fn calculate_earnings(&self, mining_type: &str) {
        let mut stats_map = self.stats.lock().await;
        if let Some(stats) = stats_map.get_mut(mining_type) {
            // Rough earnings calculation (would need real pool data in production)
            let daily_earnings = match mining_type {
                "whive" => {
                    // Estimate based on hashrate and current Whive difficulty/price
                    let blocks_per_day = (stats.hashrate * 86400.0) / 1_000_000.0; // Very rough estimate
                    blocks_per_day * 0.001 // Placeholder
                }
                "bitcoin" => {
                    // Bitcoin CPU mining earnings are essentially zero
                    (stats.hashrate * 86400.0) / 1_000_000_000_000.0 * 0.000001 // Extremely small
                }
                _ => 0.0,
            };
            stats.estimated_earnings = daily_earnings;
        }
    }
}

// Global stats collector instance
lazy_static::lazy_static! {
    pub static ref MINING_STATS: MiningStatsCollector = MiningStatsCollector::new();
}
