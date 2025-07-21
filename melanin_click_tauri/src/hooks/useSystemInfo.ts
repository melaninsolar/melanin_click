import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SystemInfo, CryptoConfig, HardwareInfo } from '../types';

export const useSystemInfo = () => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [cryptoConfig, setCryptoConfig] = useState<CryptoConfig | null>(null);
  const [hardwareInfo, setHardwareInfo] = useState<HardwareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSystemInfo = async () => {
    try {
      const info = await invoke<SystemInfo>('get_system_info');
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to load system info:', error);
      setError('Failed to load system information');
    }
  };

  const loadCryptoConfig = async () => {
    try {
      const config = await invoke<CryptoConfig>('get_crypto_config');
      setCryptoConfig(config);
    } catch (error) {
      console.error('Failed to load crypto config:', error);
      setError('Failed to load crypto configuration');
    }
  };

  const loadHardwareInfo = async () => {
    try {
      const info = await invoke<HardwareInfo>('get_hardware_info');
      setHardwareInfo(info);
    } catch (error) {
      console.error('Failed to load hardware info:', error);
      setError('Failed to load hardware information');
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadSystemInfo(),
        loadCryptoConfig(),
        loadHardwareInfo()
      ]);
    } catch (error) {
      console.error('Failed to refresh system info:', error);
      setError('Failed to refresh system information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return {
    systemInfo,
    cryptoConfig,
    hardwareInfo,
    loading,
    error,
    refreshAll
  };
}; 