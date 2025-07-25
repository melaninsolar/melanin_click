import { invoke } from '@tauri-apps/api/core';

interface MiningStats {
  hashrate: number;
  accepted_shares: number;
  rejected_shares: number;
  uptime: number;
  temperature: number;
  power_consumption: number;
  estimated_earnings: number;
  pool_url: string;
  algorithm: string;
  threads: number;
  last_update: string;
}

interface SystemInfo {
  platform: string;
  architecture: string;
  total_memory: number;
  available_memory: number;
  disk_space: number;
  available_disk_space: number;
  cpu_cores: number;
  cpu_brand: string;
  cpu_frequency: number;
}

interface NodeStatus {
  is_running: boolean;
  sync_progress: number;
  block_height: number;
  peer_count: number;
  network: string;
  data_dir: string;
  config_path: string;
}

interface MiningPool {
  name: string;
  url: string;
  port: number;
  fee: number;
  location: string;
  algorithm: string;
  status: 'Active' | 'Inactive' | 'Maintenance' | 'Unknown';
  latency?: number;
  description: string;
}

export class TauriService {
  // Miner Installation
  static async downloadAndInstallMiners(): Promise<string> {
    return await invoke('download_and_install_miners');
  }

  // Simple Mining (like Python script)
  static async startSimpleWhiveMining(whiveAddress: string, threads?: number): Promise<string> {
    return await invoke('start_simple_whive_mining', { whiveAddress, threads });
  }

  static async startSimpleBitcoinMining(bitcoinAddress: string, workerName: string): Promise<string> {
    return await invoke('start_simple_bitcoin_mining', { bitcoinAddress, workerName });
  }

  // Node Management
  static async downloadAndInstallBitcoin(): Promise<string> {
    return await invoke('download_and_install_bitcoin');
  }

  static async downloadAndInstallWhive(): Promise<string> {
    return await invoke('download_and_install_whive');
  }

  static async runBitcoinMainnet(useQt: boolean = false): Promise<string> {
    return await invoke('run_bitcoin_mainnet', { useQt });
  }

  static async runBitcoinPruned(useQt: boolean = false): Promise<string> {
    return await invoke('run_bitcoin_pruned', { useQt });
  }

  static async runWhiveNode(useQt: boolean = false): Promise<string> {
    return await invoke('run_whive_node', { useQt });
  }

  static async stopNode(nodeType: string): Promise<string> {
    return await invoke('stop_node', { nodeType });
  }

  static async getNodeStatus(nodeType: string): Promise<NodeStatus> {
    return await invoke('get_node_status', { nodeType });
  }

  // Enhanced Mining Operations
  static async startEnhancedWhiveMining(
    whiveAddress: string,
    threads?: number,
    intensity?: number,
    poolUrl?: string
  ): Promise<string> {
    return await invoke('start_enhanced_whive_mining', {
      whiveAddress,
      threads,
      intensity,
      poolUrl,
    });
  }

  static async startEnhancedBitcoinMining(
    bitcoinAddress: string,
    workerName: string,
    poolName: string,
    threads?: number,
    miningMode?: string
  ): Promise<string> {
    return await invoke('start_enhanced_bitcoin_mining', {
      bitcoinAddress,
      workerName,
      poolName,
      threads,
      miningMode,
    });
  }

  static async stopMining(miningType?: string): Promise<string> {
    return await invoke('stop_mining', { miningType: miningType || 'bitcoin' });
  }

  static async getMiningStatus(miningType: string): Promise<MiningStats | null> {
    return await invoke('get_mining_status', { miningType });
  }

  static async getMiningPools(): Promise<MiningPool[]> {
    return await invoke('get_mining_pools');
  }

  // Address Validation
  static async validateBitcoinAddress(address: string): Promise<boolean> {
    return await invoke('validate_bitcoin_address', { address });
  }

  static async validateWhiveAddress(address: string): Promise<boolean> {
    return await invoke('validate_whive_address', { address });
  }

  // System Information
  static async getSystemInfo(): Promise<SystemInfo> {
    return await invoke('get_system_info');
  }

  static async getRealMiningStats(miningType: string): Promise<MiningStats> {
    return await invoke('get_real_mining_stats', { miningType });
  }

  static async getHardwareInfo(): Promise<any> {
    return await invoke('get_hardware_info');
  }

  // Legacy compatibility methods
  static async checkBitcoinStatus(): Promise<string> {
    const status = await this.getNodeStatus('bitcoin_mainnet');
    return JSON.stringify({
      running: status.is_running,
      blocks: status.block_height,
      peers: status.peer_count,
      sync_progress: status.sync_progress,
    });
  }

  static async checkWhiveStatus(): Promise<string> {
    const status = await this.getNodeStatus('whive_node');
    return JSON.stringify({
      running: status.is_running,
      blocks: status.block_height,
      peers: status.peer_count,
      sync_progress: status.sync_progress,
    });
  }

  // File utilities
  static async checkFileExists(path: string): Promise<boolean> {
    return await invoke('check_file_exists', { path });
  }

  static async getDownloadProgress(url: string): Promise<any> {
    return await invoke('get_download_progress', { url });
  }
} 