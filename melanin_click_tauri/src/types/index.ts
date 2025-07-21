export interface SystemInfo {
  platform: string;
  arch: string;
  total_memory: number;
  available_memory: number;
  disk_space: number;
  available_disk_space: number;
}

export interface CryptoConfig {
  bitcoin_version: string;
  whive_version: string;
  bitcoin_data_dir: string;
  whive_data_dir: string;
}

export interface DownloadProgress {
  total_size: number;
  downloaded: number;
  speed: number;
  status: string;
}

export interface MiningPool {
  name: string;
  url: string;
  port: number;
  fee: number;
  location: string;
  algorithm: string;
  status: string;
}

export interface HardwareInfo {
  cpu_cores: number;
  cpu_threads: number;
  cpu_brand: string;
  cpu_frequency: number;
  gpu_devices: GpuDevice[];
  total_memory: number;
  available_memory: number;
}

export interface GpuDevice {
  name: string;
  vendor: string;
  memory: number;
  compute_capability: string;
  driver_version: string;
}

export interface MiningConfig {
  pool_url: string;
  pool_port: number;
  wallet_address: string;
  worker_name: string;
  mining_intensity: number;
  hardware_selection: string[];
  algorithm: string;
  auto_start: boolean;
}

export interface MiningStats {
  hashrate: number;
  accepted_shares: number;
  rejected_shares: number;
  uptime: number;
  temperature: number;
  power_consumption: number;
  estimated_earnings: number;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

export interface ProcessStatus {
  name: string;
  status: 'idle' | 'starting' | 'running' | 'stopping' | 'error';
  message?: string;
}

export type PageType = 'home' | 'bitcoin' | 'whive' | 'mining' | 'settings';

export type OnboardingStep = 'welcome' | 'terms' | 'selection' | 'complete';

export type InstallationPreference = 'bitcoin' | 'whive' | 'both';

export interface UserPreferences {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  installationPreference: InstallationPreference;
  agreedToTermsDate?: string;
} 