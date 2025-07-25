import React, { useState, useEffect } from 'react';
import { Settings, Download, CheckCircle, AlertTriangle, Cpu, HardDrive, Wifi, Shield, Info } from 'lucide-react';
import { TauriService } from '../services/tauri';
import { useNotifications } from '../hooks/useNotifications';

const SettingsPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [isDownloadingMiners, setIsDownloadingMiners] = useState(false);
  const [minersInstalled, setMinersInstalled] = useState(false);

  useEffect(() => {
    loadSystemInfo();
    checkMinersInstalled();
  }, []);

  const loadSystemInfo = async () => {
    try {
      const info = await TauriService.getSystemInfo();
      setSystemInfo(info);
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const checkMinersInstalled = async () => {
    try {
      // Check if miners directory exists
      const exists = await TauriService.checkFileExists('~/melanin_miners');
      setMinersInstalled(exists);
    } catch (error) {
      setMinersInstalled(false);
    }
  };

  const handleDownloadMiners = async () => {
    setIsDownloadingMiners(true);
    try {
      addNotification('info', 'Downloading Miners', 'Downloading and installing mining executables...');
      
      const result = await TauriService.downloadAndInstallMiners();
      
      addNotification('success', 'Miners Installed', result);
      setMinersInstalled(true);
    } catch (error) {
      addNotification('error', 'Installation Failed', error as string);
    } finally {
      setIsDownloadingMiners(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Settings & Configuration
          </h1>
          <p className="text-slate-400 text-lg">System settings and mining setup</p>
        </div>

        {/* Mining Setup Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <Download className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Mining Setup</h2>
          </div>

          <div className="space-y-4">
            {/* Mining Executables Status */}
            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${minersInstalled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <h3 className="font-semibold text-white">Mining Executables</h3>
                  <p className="text-sm text-slate-400">
                    {minersInstalled ? 'Installed and ready' : 'Required for mining operations'}
                  </p>
                </div>
              </div>
              {minersInstalled ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
            </div>

            {/* Download Button */}
            {!minersInstalled && (
              <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-400 mb-2">⚠️ Mining Setup Required</h3>
                    <p className="text-slate-300 leading-relaxed mb-4">
                      Mining executables are required for cryptocurrency mining operations. 
                      This will download cpuminer-multi for Whive (Yespower) mining and cgminer for Bitcoin mining.
                    </p>
                    <ul className="text-sm text-slate-400 space-y-1 mb-4">
                      <li>• <strong>cpuminer-multi</strong> - Optimized CPU miner for Yespower algorithm</li>
                      <li>• <strong>cgminer</strong> - ASIC/USB stick miner for Bitcoin</li>
                      <li>• <strong>Platform-specific</strong> - Automatically detects your system</li>
                    </ul>
                  </div>
                </div>
                
                <button
                  onClick={handleDownloadMiners}
                  disabled={isDownloadingMiners}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>{isDownloadingMiners ? 'Downloading Mining Executables...' : 'Download & Install Mining Executables'}</span>
                </button>
              </div>
            )}

            {/* Success Message */}
            {minersInstalled && (
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-400">✅ Mining Setup Complete</h3>
                    <p className="text-slate-300">
                      Mining executables are installed and ready. You can now start mining Bitcoin and Whive.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* System Information */}
        {systemInfo && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-6">
              <Info className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-semibold text-white">System Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">CPU Information</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Brand:</span>
                    <span className="text-white">{systemInfo.cpu_brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cores:</span>
                    <span className="text-white">{systemInfo.cpu_cores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Threads:</span>
                    <span className="text-white">{systemInfo.cpu_threads}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frequency:</span>
                    <span className="text-white">{(systemInfo.cpu_frequency / 1000).toFixed(2)} GHz</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <HardDrive className="w-5 h-5 text-green-400" />
                  <h3 className="font-semibold text-white">Memory & Storage</h3>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex justify-between">
                    <span>Total RAM:</span>
                    <span className="text-white">{(systemInfo.total_memory / (1024 ** 3)).toFixed(1)} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available RAM:</span>
                    <span className="text-white">{(systemInfo.available_memory / (1024 ** 3)).toFixed(1)} GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform:</span>
                    <span className="text-white">{systemInfo.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Architecture:</span>
                    <span className="text-white">{systemInfo.arch}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mining Performance Recommendations */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">Mining Recommendations</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-700/30 rounded-xl">
              <h3 className="font-semibold text-white mb-3">🔥 Whive (Yespower) Mining</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• <strong>Algorithm:</strong> CPU-optimized Yespower</li>
                <li>• <strong>Recommended threads:</strong> 50-75% of CPU cores</li>
                <li>• <strong>Best for:</strong> Modern multi-core CPUs</li>
                <li>• <strong>Power efficiency:</strong> High</li>
              </ul>
            </div>

            <div className="p-4 bg-slate-700/30 rounded-xl">
              <h3 className="font-semibold text-white mb-3">₿ Bitcoin (SHA-256) Mining</h3>
              <ul className="text-sm text-slate-300 space-y-2">
                <li>• <strong>Algorithm:</strong> SHA-256 (ASIC-dominated)</li>
                <li>• <strong>CPU mining:</strong> Educational purposes only</li>
                <li>• <strong>USB stick miners:</strong> Supported</li>
                <li>• <strong>Profitability:</strong> Very low on CPU</li>
              </ul>
            </div>
          </div>

          {systemInfo && (
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl">
              <h3 className="font-semibold text-white mb-2">💡 Your System Recommendations</h3>
              <div className="text-sm text-slate-300 space-y-1">
                <p>• <strong>Optimal Whive threads:</strong> {Math.floor(systemInfo.cpu_cores * 0.75)} (75% of {systemInfo.cpu_cores} cores)</p>
                <p>• <strong>Memory usage:</strong> Low impact with {(systemInfo.total_memory / (1024 ** 3)).toFixed(1)}GB RAM</p>
                <p>• <strong>Platform:</strong> {systemInfo.platform} {systemInfo.arch} - Fully supported</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
