import React from 'react';
import { Bitcoin, Cpu, Download, Play, Square, Monitor, HardDrive, MemoryStick, CheckCircle, AlertCircle } from 'lucide-react';
import { SystemInfo, CryptoConfig, ProcessStatus } from '../types';
import { invoke } from '@tauri-apps/api/core';

interface HomePageProps {
  systemInfo: SystemInfo | null;
  cryptoConfig: CryptoConfig | null;
  processStatuses: Record<string, ProcessStatus>;
  processes: Record<string, number>;
  onAddNotification: (type: 'info' | 'success' | 'warning' | 'error', title: string, message: string) => void;
  onUpdateProcessStatus: (processKey: string, status: ProcessStatus['status'], message?: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({
  systemInfo,
  processes,
  onAddNotification,
  onUpdateProcessStatus
}) => {
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadBitcoin = async () => {
    try {
      onUpdateProcessStatus('bitcoin_download', 'starting');
      onAddNotification('info', 'Download Started', 'Bitcoin Core download has started');
      
      await invoke('download_and_install_bitcoin');
      
      onUpdateProcessStatus('bitcoin_download', 'idle');
      onAddNotification('success', 'Download Complete', 'Bitcoin Core installed successfully');
    } catch (error) {
      onUpdateProcessStatus('bitcoin_download', 'error', error as string);
      onAddNotification('error', 'Download Failed', `Failed to download Bitcoin Core: ${error}`);
    }
  };

  const downloadWhive = async () => {
    try {
      onUpdateProcessStatus('whive_download', 'starting');
      onAddNotification('info', 'Download Started', 'Whive download has started');
      
      await invoke('download_and_install_whive');
      
      onUpdateProcessStatus('whive_download', 'idle');
      onAddNotification('success', 'Download Complete', 'Whive installed successfully');
    } catch (error) {
      onUpdateProcessStatus('whive_download', 'error', error as string);
      onAddNotification('error', 'Download Failed', `Failed to download Whive: ${error}`);
    }
  };

  const startBitcoinNode = async () => {
    try {
      onUpdateProcessStatus('bitcoin_node', 'starting');
      await invoke('run_bitcoin_mainnet');
      onUpdateProcessStatus('bitcoin_node', 'running');
      onAddNotification('success', 'Node Started', 'Bitcoin node started successfully');
    } catch (error) {
      onUpdateProcessStatus('bitcoin_node', 'error', error as string);
      onAddNotification('error', 'Node Failed', `Failed to start Bitcoin node: ${error}`);
    }
  };

  const stopBitcoinNode = async () => {
    try {
      onUpdateProcessStatus('bitcoin_node', 'stopping');
      await invoke('stop_process', { processName: 'bitcoin' });
      onUpdateProcessStatus('bitcoin_node', 'idle');
      onAddNotification('success', 'Node Stopped', 'Bitcoin node stopped successfully');
    } catch (error) {
      onUpdateProcessStatus('bitcoin_node', 'error', error as string);
      onAddNotification('error', 'Stop Failed', `Failed to stop Bitcoin node: ${error}`);
    }
  };

  const startWhiveNode = async () => {
    try {
      onUpdateProcessStatus('whive_node', 'starting');
      await invoke('run_whive_node');
      onUpdateProcessStatus('whive_node', 'running');
      onAddNotification('success', 'Node Started', 'Whive node started successfully');
    } catch (error) {
      onUpdateProcessStatus('whive_node', 'error', error as string);
      onAddNotification('error', 'Node Failed', `Failed to start Whive node: ${error}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Welcome to Melanin Click</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Your professional Bitcoin and Whive desktop client. Manage nodes, mine cryptocurrency, 
          and monitor your operations with a modern, secure interface.
        </p>
      </div>

      {/* System Information */}
      {systemInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Monitor className="w-8 h-8 text-primary-500" />
              <div>
                <h3 className="font-semibold">System</h3>
                <p className="text-sm text-gray-400">Platform Info</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">OS:</span>
                <span className="capitalize">{systemInfo.platform}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Arch:</span>
                <span>{systemInfo.arch}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <MemoryStick className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-semibold">Memory</h3>
                <p className="text-sm text-gray-400">RAM Usage</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span>{formatBytes(systemInfo.total_memory)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span>{formatBytes(systemInfo.available_memory)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <HardDrive className="w-8 h-8 text-green-500" />
              <div>
                <h3 className="font-semibold">Storage</h3>
                <p className="text-sm text-gray-400">Disk Space</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span>{formatBytes(systemInfo.disk_space)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span>{formatBytes(systemInfo.available_disk_space)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center space-x-3 mb-4">
              <Bitcoin className="w-8 h-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold">Status</h3>
                <p className="text-sm text-gray-400">Node Status</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Bitcoin:</span>
                <div className="flex items-center space-x-1">
                  {processes.bitcoin ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Running</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Stopped</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Whive:</span>
                <div className="flex items-center space-x-1">
                  {processes.whive ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-500">Mining</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-500">Stopped</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-bitcoin/20 to-orange-600/20 rounded-xl p-6 border border-bitcoin/30">
          <div className="flex items-center space-x-3 mb-4">
            <Bitcoin className="w-8 h-8 text-bitcoin" />
            <div>
              <h3 className="text-xl font-semibold">Bitcoin Core</h3>
              <p className="text-gray-400">Download and run Bitcoin node</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={downloadBitcoin}
              className="flex items-center space-x-2 bg-bitcoin hover:bg-bitcoin/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            {processes.bitcoin ? (
              <button
                onClick={stopBitcoinNode}
                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Square className="w-4 h-4" />
                <span>Stop Node</span>
              </button>
            ) : (
              <button
                onClick={startBitcoinNode}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Start Node</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-whive/20 to-purple-600/20 rounded-xl p-6 border border-whive/30">
          <div className="flex items-center space-x-3 mb-4">
            <Cpu className="w-8 h-8 text-whive" />
            <div>
              <h3 className="text-xl font-semibold">Whive Protocol</h3>
              <p className="text-gray-400">CPU mining and node operations</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={downloadWhive}
              className="flex items-center space-x-2 bg-whive hover:bg-whive/80 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
            <button
              onClick={startWhiveNode}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              <span>Start Node</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 