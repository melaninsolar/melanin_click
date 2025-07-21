import { invoke } from '@tauri-apps/api/core';
import { SystemInfo, CryptoConfig, HardwareInfo, MiningPool, MiningConfig, MiningStats } from '../types';

export class TauriService {
  // System Information
  static async getSystemInfo(): Promise<SystemInfo> {
    return await invoke('get_system_info');
  }

  static async getCryptoConfig(): Promise<CryptoConfig> {
    return await invoke('get_crypto_config');
  }

  static async getHardwareInfo(): Promise<HardwareInfo> {
    return await invoke('get_hardware_info');
  }

  // Download and Installation
  static async getBitcoinDownloadUrl(): Promise<string> {
    return await invoke('get_bitcoin_download_url');
  }

  static async getWhiveDownloadUrl(): Promise<string> {
    return await invoke('get_whive_download_url');
  }

  static async downloadAndInstallBitcoin(): Promise<string> {
    return await invoke('download_and_install_bitcoin');
  }

  static async downloadAndInstallWhive(): Promise<string> {
    return await invoke('download_and_install_whive');
  }

  static async getDownloadProgress(url: string): Promise<any> {
    return await invoke('get_download_progress', { url });
  }

  // Node Operations
  static async runBitcoinMainnet(): Promise<string> {
    return await invoke('run_bitcoin_mainnet');
  }

  static async runBitcoinPruned(): Promise<string> {
    return await invoke('run_bitcoin_pruned');
  }

  static async runWhiveNode(): Promise<string> {
    return await invoke('run_whive_node');
  }

  static async checkBitcoinStatus(): Promise<string> {
    return await invoke('check_bitcoin_status');
  }

  static async checkWhiveStatus(): Promise<string> {
    return await invoke('check_whive_status');
  }

  // Mining Operations
  static async startBitcoinMining(bitcoinAddress: string, workerName: string, poolName: string): Promise<string> {
    return await invoke('start_bitcoin_mining', { 
      bitcoin_address: bitcoinAddress, 
      worker_name: workerName, 
      pool_name: poolName 
    });
  }

  static async startWhiveMining(whiveAddress: string): Promise<string> {
    return await invoke('start_whive_mining', { whive_address: whiveAddress });
  }

  // Enhanced Mining Operations with Address Validation
  static async startEnhancedBitcoinMining(
    bitcoinAddress: string, 
    workerName: string, 
    poolName: string, 
    threads?: number
  ): Promise<string> {
    return await invoke('start_enhanced_bitcoin_mining', { 
      bitcoin_address: bitcoinAddress, 
      worker_name: workerName, 
      pool_name: poolName,
      threads 
    });
  }

  static async startEnhancedWhiveMining(
    whiveAddress: string, 
    threads?: number, 
    intensity?: number
  ): Promise<string> {
    return await invoke('start_enhanced_whive_mining', { 
      whive_address: whiveAddress, 
      threads,
      intensity 
    });
  }

  static async stopMining(): Promise<string> {
    return await invoke('stop_mining');
  }

  static async getMiningStats(): Promise<MiningStats> {
    return await invoke('get_mining_stats');
  }

  static async getRealMiningStats(miningType: string): Promise<MiningStats> {
    return await invoke('get_real_mining_stats', { mining_type: miningType });
  }

  // Address Validation
  static async validateBitcoinAddress(address: string): Promise<boolean> {
    return await invoke('validate_bitcoin_address', { address });
  }

  static async validateWhiveAddress(address: string): Promise<boolean> {
    return await invoke('validate_whive_address', { address });
  }

  // Pool Management
  static async getMiningPools(): Promise<MiningPool[]> {
    return await invoke('get_mining_pools');
  }

  static async saveMiningConfig(config: MiningConfig): Promise<string> {
    return await invoke('save_mining_config', { config });
  }

  static async loadMiningConfig(): Promise<MiningConfig | null> {
    return await invoke('load_mining_config');
  }

  // Utility Functions
  static async executeCommand(command: string, args: string[], workingDir?: string): Promise<string> {
    return await invoke('execute_command', { command, args, working_dir: workingDir });
  }

  static async startProcess(command: string, args: string[], workingDir?: string): Promise<number> {
    return await invoke('start_process', { command, args, working_dir: workingDir });
  }

  static async stopProcess(processName: string): Promise<string> {
    return await invoke('stop_process', { process_name: processName });
  }

  static async verifyFileHash(filePath: string, expectedHash: string): Promise<boolean> {
    return await invoke('verify_file_hash', { file_path: filePath, expected_hash: expectedHash });
  }

  static async createDirectory(path: string): Promise<string> {
    return await invoke('create_directory', { path });
  }

  static async checkFileExists(path: string): Promise<boolean> {
    return await invoke('check_file_exists', { path });
  }

  static async getFileSize(path: string): Promise<number> {
    return await invoke('get_file_size', { path });
  }

  static async benchmarkHardware(): Promise<Record<string, number>> {
    return await invoke('benchmark_hardware');
  }
} 