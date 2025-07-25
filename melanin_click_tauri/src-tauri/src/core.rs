use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};
use std::sync::Arc;
use tokio::sync::Mutex;
use crate::AppError;

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
}

#[derive(Debug, Clone)]
pub enum ProcessStatus {
    Running,
    Stopped,
    Failed(String),
}

pub struct ProcessManager {
    processes: Arc<Mutex<HashMap<ProcessName, ProcessInfo>>>,
}

impl ProcessManager {
    pub fn new() -> Self {
        Self {
            processes: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn start_process(
        &self,
        name: &str,
        executable: &Path,
        args: &[&str],
        working_dir: Option<&Path>,
    ) -> Result<ProcessId, AppError> {
        let mut cmd = Command::new(executable);
        cmd.args(args);
        
        if let Some(dir) = working_dir {
            cmd.current_dir(dir);
        }
        
        cmd.stdout(Stdio::piped())
           .stderr(Stdio::piped())
           .stdin(Stdio::null());

        let child = cmd.spawn()
            .map_err(|e| AppError::Process(format!("Failed to start {}: {}", name, e)))?;

        let pid = child.id();
        
        let process_info = ProcessInfo {
            pid,
            name: name.to_string(),
            command: executable.display().to_string(),
            args: args.iter().map(|s| s.to_string()).collect(),
            started_at: chrono::Utc::now(),
            status: ProcessStatus::Running,
        };

        let mut processes = self.processes.lock().await;
        processes.insert(name.to_string(), process_info);

        // Detach the child process so it continues running
        std::mem::forget(child);

        Ok(pid)
    }

    pub async fn stop_process(&self, name: &str) -> Result<(), AppError> {
        let mut processes = self.processes.lock().await;
        
        if let Some(process_info) = processes.get_mut(name) {
            let pid = process_info.pid;
            
            #[cfg(unix)]
            {
                // Try graceful shutdown first
                let _ = Command::new("kill")
                    .args(&["-TERM", &pid.to_string()])
                    .output();
                
                // Wait a bit, then force kill if needed
                tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
                
                let _ = Command::new("kill")
                    .args(&["-KILL", &pid.to_string()])
                    .output();
            }
            
            #[cfg(windows)]
            {
                let _ = Command::new("taskkill")
                    .args(&["/PID", &pid.to_string(), "/F"])
                    .output();
            }
            
            process_info.status = ProcessStatus::Stopped;
            Ok(())
        } else {
            Err(AppError::Process(format!("Process '{}' not found", name)))
        }
    }

    pub async fn is_process_running(&self, name: &str) -> bool {
        let processes = self.processes.lock().await;
        if let Some(process_info) = processes.get(name) {
            // Check if process is actually still running
            self.check_process_exists(process_info.pid)
        } else {
            false
        }
    }

    pub async fn get_process_info(&self, name: &str) -> Option<ProcessInfo> {
        let processes = self.processes.lock().await;
        processes.get(name).cloned()
    }

    pub async fn list_processes(&self) -> Vec<ProcessInfo> {
        let processes = self.processes.lock().await;
        processes.values().cloned().collect()
    }

    fn check_process_exists(&self, pid: ProcessId) -> bool {
        #[cfg(unix)]
        {
            match Command::new("kill")
                .args(&["-0", &pid.to_string()])
                .output()
            {
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
                },
                Err(_) => false,
            }
        }
    }
}

// Global process manager instance
static PROCESS_MANAGER: std::sync::OnceLock<ProcessManager> = std::sync::OnceLock::new();

pub fn get_process_manager() -> &'static ProcessManager {
    PROCESS_MANAGER.get_or_init(|| ProcessManager::new())
}

// Utility functions
pub async fn find_executable_in_path(base_path: &Path, executable_name: &str) -> Result<PathBuf, AppError> {
    fn search_recursive(dir: &Path, target: &str) -> Option<PathBuf> {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.is_dir() {
                    if let Some(found) = search_recursive(&path, target) {
                        return Some(found);
                    }
                } else if path.file_name()
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
    
    search_recursive(base_path, executable_name)
        .ok_or_else(|| AppError::Process(format!(
            "{} executable not found in {}", 
            executable_name, 
            base_path.display()
        )))
}

pub async fn ensure_directory_exists(path: &Path) -> Result<(), AppError> {
    if !path.exists() {
        std::fs::create_dir_all(path)
            .map_err(|e| AppError::Io(e))?;
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