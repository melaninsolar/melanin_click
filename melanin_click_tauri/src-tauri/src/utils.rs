use crate::{AppError, AppState, DownloadProgress};
use std::path::Path;
use tauri::State;

#[tauri::command]
pub async fn get_download_progress(
    url: String,
    state: State<'_, AppState>,
) -> Result<Option<DownloadProgress>, AppError> {
    let downloads = state.downloads.lock().await;
    Ok(downloads.get(&url).cloned())
}

#[tauri::command]
pub async fn check_file_exists(path: String) -> Result<bool, AppError> {
    Ok(Path::new(&path).exists())
}

#[tauri::command]
pub async fn create_directory(path: String) -> Result<String, AppError> {
    std::fs::create_dir_all(&path)?;
    Ok(format!("Directory created: {}", path))
}

#[tauri::command]
pub async fn get_file_size(path: String) -> Result<u64, AppError> {
    let metadata = std::fs::metadata(&path)?;
    Ok(metadata.len())
}
