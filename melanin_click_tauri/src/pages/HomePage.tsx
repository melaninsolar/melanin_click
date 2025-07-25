import React from 'react';
import { Bitcoin, Cpu, Download, Play, Square, Monitor, HardDrive, MemoryStick, CheckCircle, AlertCircle, Activity, Zap, TrendingUp, Server } from 'lucide-react';
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
      await invoke('stop_node', { nodeType: 'bitcoin_mainnet' });
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
    <div className="content-spacing animate-fade-in-up">
      {/* Hero Section */}
      <div className="text-center section-padding border-b border-slate-700/50">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            Welcome to <span className="text-gradient">Melanin Click</span>
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 leading-relaxed">
            Your professional Bitcoin and Whive desktop client. Manage nodes, mine cryptocurrency, 
            and monitor your operations with a modern, secure interface.
          </p>
          
          {/* Status Overview */}
          <div className="flex justify-center items-center space-x-8 pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-slate-300">System Online</span>
            </div>
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-slate-300">
                {Object.values(processes).length} Active Processes
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm font-medium text-slate-300">Ready to Mine</span>
            </div>
          </div>
        </div>
      </div>

      {/* System Information Grid */}
      {systemInfo && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-200">System Overview</h2>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Monitor className="w-4 h-4" />
              <span>Real-time monitoring</span>
            </div>
          </div>
          
          <div className="grid-responsive">
            {/* System Info Card */}
            <div className="glass-strong rounded-xl card-padding card-hover border-slate-600/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-primary-500/20 rounded-lg">
                  <Monitor className="w-6 h-6 text-primary-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">System</h3>
                  <p className="text-sm text-slate-400">Platform Information</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400 font-medium">Operating System</span>
                  <span className="text-slate-200 capitalize font-semibold">{systemInfo.platform}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-medium">Architecture</span>
                  <span className="text-slate-200 font-semibold">{systemInfo.arch}</span>
                </div>
              </div>
            </div>

            {/* Memory Card */}
            <div className="glass-strong rounded-xl card-padding card-hover border-slate-600/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <MemoryStick className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Memory</h3>
                  <p className="text-sm text-slate-400">RAM Usage & Availability</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400 font-medium">Total RAM</span>
                  <span className="text-slate-200 font-semibold">{formatBytes(systemInfo.total_memory)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-medium">Available</span>
                  <span className="text-green-400 font-semibold">{formatBytes(systemInfo.available_memory)}</span>
                </div>
                {/* Memory usage bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Memory Usage</span>
                    <span>{Math.round(((systemInfo.total_memory - systemInfo.available_memory) / systemInfo.total_memory) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((systemInfo.total_memory - systemInfo.available_memory) / systemInfo.total_memory) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Card */}
            <div className="glass-strong rounded-xl card-padding card-hover border-slate-600/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <HardDrive className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Storage</h3>
                  <p className="text-sm text-slate-400">Disk Space Management</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400 font-medium">Total Space</span>
                  <span className="text-slate-200 font-semibold">{formatBytes(systemInfo.disk_space)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-medium">Available</span>
                  <span className="text-green-400 font-semibold">{formatBytes(systemInfo.available_disk_space)}</span>
                </div>
                {/* Storage usage bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-slate-400 mb-2">
                    <span>Disk Usage</span>
                    <span>{Math.round(((systemInfo.disk_space - systemInfo.available_disk_space) / systemInfo.disk_space) * 100)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${((systemInfo.disk_space - systemInfo.available_disk_space) / systemInfo.disk_space) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Card */}
            <div className="glass-strong rounded-xl card-padding card-hover border-slate-600/50">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-200">Node Status</h3>
                  <p className="text-sm text-slate-400">Active Processes</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/50">
                  <span className="text-slate-400 font-medium">Bitcoin Node</span>
                  <div className="flex items-center space-x-2">
                    {processes.bitcoin ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">Running</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-500 font-semibold">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-400 font-medium">Whive Node</span>
                  <div className="flex items-center space-x-2">
                    {processes.whive ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">Mining</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-500 font-semibold">Stopped</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-200">Quick Actions</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Zap className="w-4 h-4" />
            <span>One-click operations</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bitcoin Section */}
          <div className="glass-strong rounded-xl card-padding border border-orange-500/30 card-hover">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 rounded-xl">
                <Bitcoin className="w-8 h-8 text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gradient-bitcoin">Bitcoin Core</h3>
                <p className="text-slate-400 mt-1">Download, install, and run Bitcoin node operations</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={downloadBitcoin}
                className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              {processes.bitcoin ? (
                <button
                  onClick={stopBitcoinNode}
                  className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <Square className="w-4 h-4" />
                  <span>Stop Node</span>
                </button>
              ) : (
                <button
                  onClick={startBitcoinNode}
                  className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                >
                  <Play className="w-4 h-4" />
                  <span>Start Node</span>
                </button>
              )}
            </div>
          </div>

          {/* Whive Section */}
          <div className="glass-strong rounded-xl card-padding border border-purple-500/30 card-hover">
            <div className="flex items-center space-x-4 mb-6">
              <div className="p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl">
                <Cpu className="w-8 h-8 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gradient-whive">Whive Protocol</h3>
                <p className="text-slate-400 mt-1">CPU mining and node operations for Whive blockchain</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={downloadWhive}
                className="flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              
              <button
                onClick={startWhiveNode}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              >
                <Play className="w-4 h-4" />
                <span>Start Node</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 