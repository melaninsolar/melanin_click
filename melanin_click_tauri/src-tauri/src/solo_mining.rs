use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use reqwest::Client;
use base64::{Engine as _, engine::general_purpose};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoloMiningConfig {
    pub bitcoin_rpc_url: String,
    pub bitcoin_rpc_user: String,
    pub bitcoin_rpc_password: String,
    pub whive_rpc_url: String,
    pub whive_rpc_user: String,
    pub whive_rpc_password: String,
    pub mining_address: String,
    pub cryptocurrency: String, // "bitcoin" or "whive"
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BlockTemplate {
    pub version: u32,
    pub previous_block_hash: String,
    pub transactions: Vec<String>,
    pub coinbase_value: u64,
    pub target: String,
    pub min_time: u64,
    pub cur_time: u64,
    pub bits: String,
    pub height: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SoloMiningStats {
    pub is_active: bool,
    pub current_block_height: u64,
    pub difficulty: f64,
    pub network_hashrate: String,
    pub blocks_found: u64,
    pub mining_address: String,
}

pub struct SoloMiner {
    config: Arc<Mutex<Option<SoloMiningConfig>>>,
    stats: Arc<Mutex<SoloMiningStats>>,
    client: Client,
    is_mining: Arc<Mutex<bool>>,
}

impl SoloMiner {
    pub fn new() -> Self {
        Self {
            config: Arc::new(Mutex::new(None)),
            stats: Arc::new(Mutex::new(SoloMiningStats {
                is_active: false,
                current_block_height: 0,
                difficulty: 0.0,
                network_hashrate: "0 H/s".to_string(),
                blocks_found: 0,
                mining_address: String::new(),
            })),
            client: Client::new(),
            is_mining: Arc::new(Mutex::new(false)),
        }
    }

    pub async fn configure(&self, config: SoloMiningConfig) -> Result<(), String> {
        // Validate RPC connection
        self.test_rpc_connection(&config).await?;
        
        let mut conf = self.config.lock().await;
        *conf = Some(config.clone());

        let mut stats = self.stats.lock().await;
        stats.mining_address = config.mining_address;
        
        Ok(())
    }

    async fn test_rpc_connection(&self, config: &SoloMiningConfig) -> Result<(), String> {
        let (rpc_url, rpc_user, rpc_password) = match config.cryptocurrency.as_str() {
            "bitcoin" => (&config.bitcoin_rpc_url, &config.bitcoin_rpc_user, &config.bitcoin_rpc_password),
            "whive" => (&config.whive_rpc_url, &config.whive_rpc_user, &config.whive_rpc_password),
            _ => return Err("Invalid cryptocurrency specified".to_string()),
        };

        let auth = general_purpose::STANDARD.encode(format!("{}:{}", rpc_user, rpc_password));
        
        let rpc_request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getblockchaininfo",
            "params": []
        });

        let response = self.client
            .post(rpc_url)
            .header("Authorization", format!("Basic {}", auth))
            .header("Content-Type", "application/json")
            .json(&rpc_request)
            .send()
            .await
            .map_err(|e| format!("RPC connection failed: {}", e))?;

        if !response.status().is_success() {
            return Err(format!("RPC error: {}", response.status()));
        }

        Ok(())
    }

    pub async fn get_block_template(&self) -> Result<BlockTemplate, String> {
        let config = self.config.lock().await;
        let config = config.as_ref().ok_or("Solo mining not configured")?;

        let (rpc_url, rpc_user, rpc_password) = match config.cryptocurrency.as_str() {
            "bitcoin" => (&config.bitcoin_rpc_url, &config.bitcoin_rpc_user, &config.bitcoin_rpc_password),
            "whive" => (&config.whive_rpc_url, &config.whive_rpc_user, &config.whive_rpc_password),
            _ => return Err("Invalid cryptocurrency specified".to_string()),
        };

        let auth = general_purpose::STANDARD.encode(format!("{}:{}", rpc_user, rpc_password));
        
        let rpc_request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getblocktemplate",
            "params": [{
                "rules": ["segwit"]
            }]
        });

        let response = self.client
            .post(rpc_url)
            .header("Authorization", format!("Basic {}", auth))
            .header("Content-Type", "application/json")
            .json(&rpc_request)
            .send()
            .await
            .map_err(|e| format!("Failed to get block template: {}", e))?;

        let json_response: serde_json::Value = response.json().await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if let Some(error) = json_response.get("error") {
            return Err(format!("RPC error: {}", error));
        }

        let result = json_response.get("result")
            .ok_or("Missing result in response")?;

        // Parse block template (simplified)
        let block_template = BlockTemplate {
            version: result.get("version").and_then(|v| v.as_u64()).unwrap_or(0) as u32,
            previous_block_hash: result.get("previousblockhash")
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string(),
            transactions: vec![], // Simplified
            coinbase_value: result.get("coinbasevalue").and_then(|v| v.as_u64()).unwrap_or(0),
            target: result.get("target").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            min_time: result.get("mintime").and_then(|v| v.as_u64()).unwrap_or(0),
            cur_time: result.get("curtime").and_then(|v| v.as_u64()).unwrap_or(0),
            bits: result.get("bits").and_then(|v| v.as_str()).unwrap_or("").to_string(),
            height: result.get("height").and_then(|v| v.as_u64()).unwrap_or(0),
        };

        Ok(block_template)
    }

    pub async fn submit_block(&self, block_hex: String) -> Result<bool, String> {
        let config = self.config.lock().await;
        let config = config.as_ref().ok_or("Solo mining not configured")?;

        let (rpc_url, rpc_user, rpc_password) = match config.cryptocurrency.as_str() {
            "bitcoin" => (&config.bitcoin_rpc_url, &config.bitcoin_rpc_user, &config.bitcoin_rpc_password),
            "whive" => (&config.whive_rpc_url, &config.whive_rpc_user, &config.whive_rpc_password),
            _ => return Err("Invalid cryptocurrency specified".to_string()),
        };

        let auth = general_purpose::STANDARD.encode(format!("{}:{}", rpc_user, rpc_password));
        
        let rpc_request = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "submitblock",
            "params": [block_hex]
        });

        let response = self.client
            .post(rpc_url)
            .header("Authorization", format!("Basic {}", auth))
            .header("Content-Type", "application/json")
            .json(&rpc_request)
            .send()
            .await
            .map_err(|e| format!("Failed to submit block: {}", e))?;

        let json_response: serde_json::Value = response.json().await
            .map_err(|e| format!("Failed to parse response: {}", e))?;

        if let Some(error) = json_response.get("error") {
            if error.is_null() {
                // Success - increment blocks found
                let mut stats = self.stats.lock().await;
                stats.blocks_found += 1;
                return Ok(true);
            } else {
                return Err(format!("Block submission error: {}", error));
            }
        }

        Ok(false)
    }

    pub async fn start_mining(&self) -> Result<(), String> {
        let mut is_mining = self.is_mining.lock().await;
        if *is_mining {
            return Err("Mining already active".to_string());
        }
        
        *is_mining = true;
        let mut stats = self.stats.lock().await;
        stats.is_active = true;
        
        Ok(())
    }

    pub async fn stop_mining(&self) -> Result<(), String> {
        let mut is_mining = self.is_mining.lock().await;
        *is_mining = false;
        
        let mut stats = self.stats.lock().await;
        stats.is_active = false;
        
        Ok(())
    }

    pub async fn get_stats(&self) -> SoloMiningStats {
        self.stats.lock().await.clone()
    }
}

// Tauri commands for solo mining
#[tauri::command]
pub async fn configure_solo_mining(
    solo_miner: tauri::State<'_, SoloMiner>,
    config: SoloMiningConfig,
) -> Result<(), String> {
    solo_miner.configure(config).await
}

#[tauri::command]
pub async fn start_solo_mining(
    solo_miner: tauri::State<'_, SoloMiner>,
) -> Result<(), String> {
    solo_miner.start_mining().await
}

#[tauri::command]
pub async fn stop_solo_mining(
    solo_miner: tauri::State<'_, SoloMiner>,
) -> Result<(), String> {
    solo_miner.stop_mining().await
}

#[tauri::command]
pub async fn get_solo_mining_stats(
    solo_miner: tauri::State<'_, SoloMiner>,
) -> Result<SoloMiningStats, String> {
    Ok(solo_miner.get_stats().await)
}

#[tauri::command]
pub async fn get_solo_block_template(
    solo_miner: tauri::State<'_, SoloMiner>,
) -> Result<BlockTemplate, String> {
    solo_miner.get_block_template().await
}