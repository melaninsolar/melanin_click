use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::Mutex;
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BatteryInfo {
    pub level: f32,
    pub is_charging: bool,
    pub temperature: Option<f32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MobileSettings {
    pub battery_threshold: f32,  // Stop mining below this battery level
    pub temperature_threshold: f32,  // Stop mining above this temperature
    pub background_mining_enabled: bool,
    pub charging_only_mode: bool,
}

impl Default for MobileSettings {
    fn default() -> Self {
        Self {
            battery_threshold: 20.0,  // Stop mining below 20%
            temperature_threshold: 45.0,  // Stop mining above 45°C
            background_mining_enabled: true,
            charging_only_mode: false,
        }
    }
}

pub struct MobileManager {
    pub settings: Arc<Mutex<MobileSettings>>,
    pub current_battery: Arc<Mutex<Option<BatteryInfo>>>,
    pub mining_allowed: Arc<Mutex<bool>>,
}

impl MobileManager {
    pub fn new() -> Self {
        Self {
            settings: Arc::new(Mutex::new(MobileSettings::default())),
            current_battery: Arc::new(Mutex::new(None)),
            mining_allowed: Arc::new(Mutex::new(true)),
        }
    }

    pub async fn update_battery_info(&self, battery: BatteryInfo) -> Result<(), String> {
        let mut current_battery = self.current_battery.lock().await;
        *current_battery = Some(battery.clone());

        let settings = self.settings.lock().await;
        let mut mining_allowed = self.mining_allowed.lock().await;

        // Check battery level
        let battery_ok = battery.level >= settings.battery_threshold;
        
        // Check charging requirement
        let charging_ok = !settings.charging_only_mode || battery.is_charging;
        
        // Check temperature
        let temp_ok = battery.temperature
            .map(|temp| temp <= settings.temperature_threshold)
            .unwrap_or(true);

        *mining_allowed = battery_ok && charging_ok && temp_ok;

        Ok(())
    }

    pub async fn is_mining_allowed(&self) -> bool {
        *self.mining_allowed.lock().await
    }

    pub async fn get_battery_info(&self) -> Option<BatteryInfo> {
        self.current_battery.lock().await.clone()
    }

    pub async fn update_settings(&self, new_settings: MobileSettings) -> Result<(), String> {
        let mut settings = self.settings.lock().await;
        *settings = new_settings;
        
        // Re-evaluate mining permission with new settings
        if let Some(battery) = self.current_battery.lock().await.clone() {
            drop(settings); // Release the lock
            self.update_battery_info(battery).await?;
        }
        
        Ok(())
    }

    pub async fn get_settings(&self) -> MobileSettings {
        self.settings.lock().await.clone()
    }
}

// Tauri commands for mobile functionality
#[tauri::command]
pub async fn get_battery_status(
    mobile_manager: State<'_, MobileManager>,
) -> Result<Option<BatteryInfo>, String> {
    Ok(mobile_manager.get_battery_info().await)
}

#[tauri::command]
pub async fn update_mobile_settings(
    mobile_manager: State<'_, MobileManager>,
    settings: MobileSettings,
) -> Result<(), String> {
    mobile_manager.update_settings(settings).await
}

#[tauri::command]
pub async fn get_mobile_settings(
    mobile_manager: State<'_, MobileManager>,
) -> Result<MobileSettings, String> {
    Ok(mobile_manager.get_settings().await)
}

#[tauri::command]
pub async fn is_mobile_mining_allowed(
    mobile_manager: State<'_, MobileManager>,
) -> Result<bool, String> {
    Ok(mobile_manager.is_mining_allowed().await)
}

#[cfg(target_os = "android")]
pub mod android {
    use super::*;
    use std::time::Duration;
    use tokio::time::interval;

    pub async fn start_battery_monitoring(mobile_manager: Arc<MobileManager>) {
        let mut interval = interval(Duration::from_secs(30)); // Check every 30 seconds
        
        loop {
            interval.tick().await;
            
            // TODO: Implement actual battery reading using Android APIs
            // For now, simulate battery info
            let battery_info = BatteryInfo {
                level: 80.0, // Placeholder
                is_charging: false, // Placeholder
                temperature: Some(35.0), // Placeholder
            };
            
            if let Err(e) = mobile_manager.update_battery_info(battery_info).await {
                eprintln!("Failed to update battery info: {}", e);
            }
        }
    }
}