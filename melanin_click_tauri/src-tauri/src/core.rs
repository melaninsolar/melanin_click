use crate::AppError;
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Arc;
use tokio::process::Child;
use tokio::sync::Mutex;
use tracing::{debug, error, info, warn};

pub type ProcessId = u32;
pub type ProcessName = String;

#[derive(Debug, Clone)]
pub struct ProcessInfo {
    pub pid: ProcessId,
    pub name: ProcessName,
    pub command: String,
    pub args: Vec<String>,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub status: ProcessStatus,
    pub resource_usage: ResourceUsage,
}

#[derive(Debug, Clone)]
pub struct ResourceUsage {
    pub cpu_percent: f64,
    pub memory_mb: u64,
    pub uptime_seconds: u64,
}

#[derive(Debug, Clone)]
pub enum ProcessStatus {
    Running,
    Stopped,
    Failed(String),
}

pub struct ProcessManager {
    processes: Arc<Mutex<HashMap<ProcessName, ProcessInfo>>>,
    active_children: Arc<Mutex<HashMap<ProcessName, Child>>>,
}

impl Default for ProcessManager {
    fn default() -> Self {
        Self::new()
    }
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
            active_children: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn start_process(
        &self,
        name: &str,
        executable: &Path,
        args: &[&str],
        working_dir: Option<&Path>,
    ) -> Result<ProcessId, AppError> {
        info!(
            "Starting process: {} with command: {}",
            name,
            executable.display()
        );

        // Check if process is already running
        if self.is_process_running(name).await {
            return Err(AppError::Process(format!(
                "Process '{name}' is already running"
            )));
        }

        let mut cmd = tokio::process::Command::new(executable);
        cmd.args(args);

        if let Some(dir) = working_dir {
            cmd.current_dir(dir);
        }

        cmd.stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .stdin(Stdio::null())
            .kill_on_drop(true); // Ensure child is killed when dropped

        let child = cmd
            .spawn()
            .map_err(|e| AppError::Process(format!("Failed to start {name}: {e}")))?;

        let pid = child.id().unwrap_or(0);

        let process_info = ProcessInfo {
            pid,
            name: name.to_string(),
            command: executable.display().to_string(),
            args: args.iter().map(|s| s.to_string()).collect(),
            started_at: chrono::Utc::now(),
            status: ProcessStatus::Running,
            resource_usage: ResourceUsage {
                cpu_percent: 0.0,
                memory_mb: 0,
                uptime_seconds: 0,
            },
        };

        // Store both process info and child handle
        {
            let mut processes = self.processes.lock().await;
            processes.insert(name.to_string(), process_info);
        }

        {
            let mut children = self.active_children.lock().await;
            children.insert(name.to_string(), child);
        }

        info!("Successfully started process: {} with PID: {}", name, pid);
        Ok(pid)
    }

    pub async fn stop_process(&self, name: &str) -> Result<(), AppError> {
        info!("Stopping process: {}", name);

        // First try to gracefully stop via child handle
        let mut child_removed = false;
        {
            let mut children = self.active_children.lock().await;
            if let Some(mut child) = children.remove(name) {
                // Try graceful shutdown first
                match child.start_kill() {
                    Ok(_) => {
                        info!("Sent SIGTERM to process: {}", name);

                        // Wait for up to 5 seconds for graceful shutdown
                        match tokio::time::timeout(
                            tokio::time::Duration::from_secs(5),
                            child.wait(),
                        )
                        .await
                        {
                            Ok(Ok(exit_status)) => {
                                info!("Process {} exited gracefully: {:?}", name, exit_status);
                            }
                            Ok(Err(e)) => {
                                warn!("Error waiting for process {}: {}", name, e);
                            }
                            Err(_) => {
                                warn!("Process {} did not exit gracefully, force killing", name);
                                let _ = child.kill().await;
                            }
                        }
                    }
                    Err(e) => {
                        error!("Failed to send kill signal to process {}: {}", name, e);
                        let _ = child.kill().await;
                    }
                }
                child_removed = true;
            }
        }

        // Update process status
        {
            let mut processes = self.processes.lock().await;
            if let Some(process_info) = processes.get_mut(name) {
                process_info.status = ProcessStatus::Stopped;
                info!("Process {} stopped successfully", name);
            } else if !child_removed {
                return Err(AppError::Process(format!("Process '{name}' not found")));
            }
        }

        Ok(())
    }

    pub async fn is_process_running(&self, name: &str) -> bool {
        // First check if we have an active child handle
        {
            let mut children = self.active_children.lock().await;
            if let Some(child) = children.get_mut(name) {
                match child.try_wait() {
                    Ok(Some(exit_status)) => {
                        debug!("Process {} has exited: {:?}", name, exit_status);
                        // Remove the child since it's no longer running
                        children.remove(name);

                        // Update process status
                        let mut processes = self.processes.lock().await;
                        if let Some(process_info) = processes.get_mut(name) {
                            process_info.status = ProcessStatus::Stopped;
                        }
                        return false;
                    }
                    Ok(None) => {
                        // Process is still running
                        return true;
                    }
                    Err(e) => {
                        error!("Error checking process status for {}: {}", name, e);
                        return false;
                    }
                }
            }
        }

        // Fallback to process info if no child handle
        let processes = self.processes.lock().await;
        if let Some(process_info) = processes.get(name) {
            matches!(process_info.status, ProcessStatus::Running)
        } else {
            false
        }
    }

    pub async fn get_process_info(&self, name: &str) -> Option<ProcessInfo> {
        let processes = self.processes.lock().await;
        processes.get(name).cloned()
    }

    pub async fn list_processes(&self) -> Vec<ProcessInfo> {
        let mut processes = self.processes.lock().await;
        let mut result = Vec::new();

        for (_name, process_info) in processes.iter_mut() {
            // Update resource usage if process is running
            if matches!(process_info.status, ProcessStatus::Running) {
                if let Ok(usage) = self.get_process_resource_usage(process_info.pid).await {
                    process_info.resource_usage = usage;
                }
            }
            result.push(process_info.clone());
        }

        result
    }

    async fn get_process_resource_usage(&self, pid: ProcessId) -> Result<ResourceUsage, AppError> {
        use sysinfo::{Pid, System};

        let mut system = System::new();
        let process_pid = Pid::from(pid as usize);
        system.refresh_process(process_pid);

        if let Some(process) = system.process(process_pid) {
            Ok(ResourceUsage {
                cpu_percent: process.cpu_usage() as f64,
                memory_mb: process.memory() / 1024 / 1024,
                uptime_seconds: process.run_time(),
            })
        } else {
            Ok(ResourceUsage {
                cpu_percent: 0.0,
                memory_mb: 0,
                uptime_seconds: 0,
            })
        }
    }

    pub async fn cleanup_dead_processes(&self) -> Result<(), AppError> {
        let mut children = self.active_children.lock().await;
        let mut processes = self.processes.lock().await;
        let mut to_remove = Vec::new();

        for (name, child) in children.iter_mut() {
            match child.try_wait() {
                Ok(Some(exit_status)) => {
                    info!("Process {} has exited: {:?}", name, exit_status);
                    to_remove.push(name.clone());

                    if let Some(process_info) = processes.get_mut(name) {
                        process_info.status = ProcessStatus::Stopped;
                    }
                }
                Ok(None) => {
                    // Process still running
                }
                Err(e) => {
                    warn!("Error checking process {}: {}", name, e);
                    to_remove.push(name.clone());

                    if let Some(process_info) = processes.get_mut(name) {
                        process_info.status = ProcessStatus::Failed(e.to_string());
                    }
                }
            }
        }

        for name in to_remove {
            children.remove(&name);
        }

        Ok(())
    }

    #[allow(dead_code)]
    fn check_process_exists(&self, pid: ProcessId) -> bool {
        #[cfg(unix)]
        {
            match Command::new("kill").args(["-0", &pid.to_string()]).output() {
                Ok(output) => output.status.success(),
                Err(_) => false,
            }
        }

        #[cfg(windows)]
        {
            match Command::new("tasklist")
                .args(&["/FI", &format!("PID eq {}", pid)])
                .output()
            {
                Ok(output) => {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    stdout.contains(&pid.to_string())
                }
                Err(_) => false,
            }
        }
    }
}

// Global process manager instance
static PROCESS_MANAGER: std::sync::OnceLock<ProcessManager> = std::sync::OnceLock::new();

pub fn get_process_manager() -> &'static ProcessManager {
    PROCESS_MANAGER.get_or_init(ProcessManager::new)
}

// Utility functions
pub async fn find_executable_in_path(
    base_path: &Path,
    executable_name: &str,
) -> Result<PathBuf, AppError> {
    fn search_recursive(dir: &Path, target: &str) -> Option<PathBuf> {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(found) = search_recursive(&path, target) {
                        return Some(found);
                    }
                } else if path
                    .file_name()
                    .and_then(|name| name.to_str())
                    .map(|name| name.contains(target))
                    .unwrap_or(false)
                {
                    return Some(path);
                }
            }
        }
        None
    }

    search_recursive(base_path, executable_name).ok_or_else(|| {
        AppError::Process(format!(
            "{} executable not found in {}",
            executable_name,
            base_path.display()
        ))
    })
}

pub async fn ensure_directory_exists(path: &Path) -> Result<(), AppError> {
    if !path.exists() {
        std::fs::create_dir_all(path).map_err(AppError::Io)?;
    }
    Ok(())
}

pub async fn set_executable_permissions(path: &Path) -> Result<(), AppError> {
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let metadata = std::fs::metadata(path)?;
        let mut perms = metadata.permissions();
        perms.set_mode(0o755);
        std::fs::set_permissions(path, perms)?;
    }
    Ok(())
}
