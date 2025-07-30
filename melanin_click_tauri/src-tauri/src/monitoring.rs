use crate::core::get_process_manager;
use crate::mining_stats::MINING_STATS;
use crate::{AppError, AppState, GpuDevice, MiningStats, SystemInfo};
use std::collections::HashMap;
use sysinfo::System;
use tauri::State;

// Get Real-time Mining Statistics
#[tauri::command]
pub async fn get_real_mining_stats(
    mining_type: String,
    _state: State<'_, AppState>,
) -> Result<MiningStats, AppError> {
    // Get real stats from the mining stats collector
    if let Some(real_stats) = MINING_STATS.get_stats(&mining_type).await {
        // Update temperature and earnings calculation
        MINING_STATS
            .update_temperature(&mining_type, get_cpu_temperature().await.unwrap_or(35.0))
            .await;
        MINING_STATS.calculate_earnings(&mining_type).await;

        // Get updated stats
        let updated_stats = MINING_STATS
            .get_stats(&mining_type)
            .await
            .unwrap_or(real_stats.clone());

        // Convert to the UI MiningStats format
        Ok(MiningStats {
            hashrate: updated_stats.hashrate,
            accepted_shares: updated_stats.accepted_shares as u64,
            rejected_shares: updated_stats.rejected_shares as u64,
            uptime: updated_stats.uptime,
            temperature: updated_stats.temperature,
            power_consumption: updated_stats.power_consumption,
            estimated_earnings: updated_stats.estimated_earnings,
            pool_url: "Mining pool".to_string(), // Real pool info would come from config
            algorithm: match mining_type.as_str() {
                "whive" => "Yespower".to_string(),
                "bitcoin" => "SHA-256d".to_string(),
                _ => mining_type.clone(),
            },
            threads: 2, // This should come from config
            last_update: chrono::Utc::now(),
        })
    } else {
        // No mining process running
        Ok(MiningStats {
            hashrate: 0.0,
            accepted_shares: 0,
            rejected_shares: 0,
            uptime: 0,
            temperature: get_cpu_temperature().await.unwrap_or(35.0),
            power_consumption: get_base_power_consumption().await,
            estimated_earnings: 0.0,
            pool_url: "Not mining".to_string(),
            algorithm: mining_type.clone(),
            threads: 0,
            last_update: chrono::Utc::now(),
        })
    }
}

// Get Comprehensive System Information
#[tauri::command]
pub async fn get_system_info(state: State<'_, AppState>) -> Result<SystemInfo, AppError> {
    let mut sys = System::new_all();
    sys.refresh_all();

    // Get system information (simplified for sysinfo v0.30)
    let platform = std::env::consts::OS.to_string();
    let arch = std::env::consts::ARCH.to_string();

    let total_memory = sys.total_memory();
    let available_memory = sys.available_memory();

    // For now, set disk space to default values - can be enhanced later
    let disk_space = 1_000_000_000_000_u64; // 1TB default
    let available_disk_space = 500_000_000_000u64; // 500GB default

    // CPU information
    let cpu_cores = sys.physical_core_count().unwrap_or(0);
    let cpu_threads = sys.cpus().len();
    let cpu_brand = sys
        .cpus()
        .first()
        .map(|cpu| cpu.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    let cpu_frequency = sys.cpus().first().map(|cpu| cpu.frequency()).unwrap_or(0);

    // GPU detection
    let gpu_devices = detect_gpu_devices().await?;

    let system_info = SystemInfo {
        platform,
        arch,
        total_memory,
        available_memory,
        disk_space,
        available_disk_space,
        cpu_cores,
        cpu_threads,
        cpu_brand,
        cpu_frequency,
        gpu_devices,
    };

    // Cache the system info
    let mut cached_info = state.system_info.lock().await;
    *cached_info = Some(system_info.clone());

    Ok(system_info)
}

// Get Hardware Information
#[tauri::command]
pub async fn get_hardware_info() -> Result<crate::HardwareInfo, AppError> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_cores = sys.physical_core_count().unwrap_or(0);
    let cpu_threads = sys.cpus().len();
    let cpu_brand = sys
        .cpus()
        .first()
        .map(|cpu| cpu.brand().to_string())
        .unwrap_or_else(|| "Unknown".to_string());
    let cpu_frequency = sys.cpus().first().map(|cpu| cpu.frequency()).unwrap_or(0);

    let gpu_devices = detect_gpu_devices().await?;

    Ok(crate::HardwareInfo {
        cpu_cores,
        cpu_threads,
        cpu_brand,
        cpu_frequency,
        gpu_devices,
        total_memory: sys.total_memory(),
        available_memory: sys.available_memory(),
    })
}

// Benchmark Hardware Performance
#[tauri::command]
pub async fn benchmark_hardware() -> Result<HashMap<String, f64>, AppError> {
    let mut results = HashMap::new();

    // CPU benchmarks
    let cpu_threads = num_cpus::get();

    // Simulate Yespower benchmark
    let yespower_hashrate = benchmark_yespower_cpu(cpu_threads).await?;
    results.insert("CPU_Yespower".to_string(), yespower_hashrate);

    // Simulate SHA-256 benchmark
    let sha256_hashrate = benchmark_sha256_cpu(cpu_threads).await?;
    results.insert("CPU_SHA256".to_string(), sha256_hashrate);

    // GPU benchmarks (if available)
    let gpu_devices = detect_gpu_devices().await?;
    for (i, gpu) in gpu_devices.iter().enumerate() {
        let gpu_hashrate = benchmark_gpu_sha256(gpu).await?;
        results.insert(format!("GPU_{}_SHA256", i), gpu_hashrate);
    }

    Ok(results)
}

// Helper functions

async fn get_cpu_temperature() -> Option<f64> {
    // Platform-specific temperature reading
    #[cfg(target_os = "linux")]
    {
        // Try to read from thermal zones
        for i in 0..10 {
            let thermal_path = format!("/sys/class/thermal/thermal_zone{}/temp", i);
            if let Ok(temp_str) = std::fs::read_to_string(&thermal_path) {
                if let Ok(temp_millidegrees) = temp_str.trim().parse::<i32>() {
                    return Some(temp_millidegrees as f64 / 1000.0);
                }
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        // Use system_profiler or similar command
        if let Ok(output) = std::process::Command::new("sysctl")
            .args(["-n", "machdep.xcpm.cpu_thermal_state"])
            .output()
        {
            if let Ok(temp_str) = String::from_utf8(output.stdout) {
                if let Ok(temp) = temp_str.trim().parse::<f64>() {
                    return Some(temp);
                }
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Windows temperature reading would require WMI
        // For now, return estimated temperature based on load
        let mut sys = System::new_all();
        sys.refresh_all();
        let cpu_usage = sys.global_cpu_info().cpu_usage();
        return Some(35.0 + (cpu_usage as f64 * 0.4)); // Estimate
    }

    None
}

async fn get_base_power_consumption() -> f64 {
    // Estimate base system power consumption
    50.0 // Watts
}

#[allow(dead_code)]
async fn calculate_mining_power_consumption(mining_type: &str, threads: u32) -> f64 {
    let base_power = get_base_power_consumption().await;
    let per_thread_power = match mining_type {
        "whive" => 15.0,  // Watts per thread for Yespower
        "bitcoin" => 8.0, // Watts per thread for SHA-256 CPU
        _ => 10.0,
    };

    base_power + (threads as f64 * per_thread_power)
}

#[allow(dead_code)]
async fn get_mining_uptime(process_name: &str) -> Option<u64> {
    let process_manager = get_process_manager();
    if let Some(process_info) = process_manager.get_process_info(process_name).await {
        let uptime = chrono::Utc::now()
            .signed_duration_since(process_info.started_at)
            .num_seconds();
        Some(uptime as u64)
    } else {
        None
    }
}

#[allow(dead_code)]
async fn estimate_hashrate(mining_type: &str, threads: u32) -> f64 {
    // Estimate hashrate based on CPU performance and algorithm
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_usage = sys.global_cpu_info().cpu_usage();
    let cpu_frequency = sys
        .cpus()
        .first()
        .map(|cpu| cpu.frequency())
        .unwrap_or(2000) as f64; // Default to 2GHz

    let base_performance = (cpu_frequency / 1000.0) * (cpu_usage as f64 / 100.0);

    match mining_type {
        "whive" => {
            // Yespower is CPU-friendly
            base_performance * threads as f64 * 450.0 // H/s per thread
        }
        "bitcoin" => {
            // SHA-256 CPU mining is much slower
            base_performance * threads as f64 * 25.0 // H/s per thread
        }
        _ => base_performance * threads as f64 * 100.0,
    }
}

async fn detect_gpu_devices() -> Result<Vec<GpuDevice>, AppError> {
    let mut devices = Vec::new();

    // NVIDIA GPU detection
    if let Ok(output) = std::process::Command::new("nvidia-smi")
        .args([
            "--query-gpu=name,memory.total,driver_version,compute_capability",
            "--format=csv,noheader,nounits",
        ])
        .output()
    {
        if output.status.success() {
            let output_str = String::from_utf8_lossy(&output.stdout);
            for line in output_str.lines() {
                let parts: Vec<&str> = line.split(',').map(|s| s.trim()).collect();
                if parts.len() >= 4 {
                    devices.push(GpuDevice {
                        name: parts[0].to_string(),
                        vendor: "NVIDIA".to_string(),
                        memory: parts[1].parse().unwrap_or(0) * 1024 * 1024, // Convert MB to bytes
                        compute_capability: parts[3].to_string(),
                        driver_version: parts[2].to_string(),
                    });
                }
            }
        }
    }

    // AMD GPU detection
    if let Ok(output) = std::process::Command::new("rocm-smi")
        .args(["--showproductname", "--showmeminfo", "vram", "--json"])
        .output()
    {
        if output.status.success() {
            // Parse ROCm-SMI JSON output
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Ok(_json_data) = serde_json::from_str::<serde_json::Value>(&output_str) {
                // Parse AMD GPU information from JSON
                devices.push(GpuDevice {
                    name: "AMD GPU".to_string(),
                    vendor: "AMD".to_string(),
                    memory: 8 * 1024 * 1024 * 1024, // Default 8GB
                    compute_capability: "Unknown".to_string(),
                    driver_version: "Unknown".to_string(),
                });
            }
        }
    }

    Ok(devices)
}

async fn benchmark_yespower_cpu(threads: usize) -> Result<f64, AppError> {
    // Estimate Yespower performance based on CPU specs
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_frequency = sys
        .cpus()
        .first()
        .map(|cpu| cpu.frequency())
        .unwrap_or(2000) as f64;

    // Yespower is memory-hard, so consider both frequency and thread count
    let estimated_hashrate = (cpu_frequency / 1000.0) * threads as f64 * 400.0;

    Ok(estimated_hashrate)
}

async fn benchmark_sha256_cpu(threads: usize) -> Result<f64, AppError> {
    // Estimate SHA-256 performance
    let mut sys = System::new_all();
    sys.refresh_all();

    let cpu_frequency = sys
        .cpus()
        .first()
        .map(|cpu| cpu.frequency())
        .unwrap_or(2000) as f64;

    let estimated_hashrate = (cpu_frequency / 1000.0) * threads as f64 * 20.0;

    Ok(estimated_hashrate)
}

async fn benchmark_gpu_sha256(gpu: &GpuDevice) -> Result<f64, AppError> {
    // Estimate GPU SHA-256 performance based on vendor
    match gpu.vendor.as_str() {
        "NVIDIA" => {
            // Rough estimation based on GPU memory (more memory = more powerful GPU)
            let memory_gb = gpu.memory as f64 / (1024.0 * 1024.0 * 1024.0);
            Ok(memory_gb * 2000.0 * 1000.0) // MH/s
        }
        "AMD" => {
            let memory_gb = gpu.memory as f64 / (1024.0 * 1024.0 * 1024.0);
            Ok(memory_gb * 1500.0 * 1000.0) // MH/s
        }
        _ => Ok(1000.0 * 1000.0), // 1 GH/s default
    }
}
