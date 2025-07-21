import React, { useState, useEffect } from 'react';
import { Bitcoin, Download, Play, Settings, RefreshCw, Globe, Database, Wallet, TrendingUp, AlertCircle, Clock, HardDrive, Loader, CheckCircle } from 'lucide-react';
import { TauriService } from '../services/tauri';
import { useNotifications } from '../hooks/useNotifications';

const BitcoinPage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isNodeRunning, setIsNodeRunning] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<string>('Not Running');
  const [downloadProgress, setDownloadProgress] = useState<{progress: number, status: string} | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkNodeStatus();
  }, []);

  const checkNodeStatus = async () => {
    try {
      const status = await TauriService.checkBitcoinStatus();
      setIsNodeRunning(true);
      setNodeStatus('Running');
      const parsed = JSON.parse(status);
      if (parsed.blocks) {
        setNodeStatus(`Synced - Block ${parsed.blocks}`);
      }
    } catch (error) {
      setIsNodeRunning(false);
      setNodeStatus('Not Running');
    }
  };

  const handleDownloadBitcoin = async () => {
    setIsDownloading(true);
    setDownloadProgress({ progress: 0, status: 'Starting download...' });
    
    try {
      addNotification('info', 'Bitcoin Core Download', 'Starting Bitcoin Core download...');

      const result = await TauriService.downloadAndInstallBitcoin();
      
      addNotification('success', 'Download Complete', result);
      
      setDownloadProgress({ progress: 100, status: 'Installation complete!' });
      
      setTimeout(() => {
        setDownloadProgress(null);
      }, 3000);
      
    } catch (error) {
      addNotification('error', 'Download Failed', error as string);
      setDownloadProgress(null);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStartMainnet = async () => {
    setIsStarting(true);
    try {
      addNotification('info', 'Starting Bitcoin Node', 'Launching Bitcoin Core mainnet node...');

      const result = await TauriService.runBitcoinMainnet();
      
      addNotification('success', 'Node Started', result);
      
      setIsNodeRunning(true);
      setNodeStatus('Starting...');
      
      // Check status after a delay
      setTimeout(() => {
        checkNodeStatus();
      }, 5000);
      
    } catch (error) {
      addNotification('error', 'Failed to Start Node', error as string);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartPruned = async () => {
    setIsStarting(true);
    try {
      addNotification('info', 'Starting Bitcoin Node', 'Launching Bitcoin Core pruned node...');

      const result = await TauriService.runBitcoinPruned();
      
      addNotification('success', 'Pruned Node Started', result);
      
      setIsNodeRunning(true);
      setNodeStatus('Starting (Pruned)...');
      
      // Check status after a delay
      setTimeout(() => {
        checkNodeStatus();
      }, 5000);
      
    } catch (error) {
      addNotification('error', 'Failed to Start Pruned Node', error as string);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-bitcoin to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Bitcoin className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Bitcoin Core</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Full Bitcoin node management, wallet operations, and blockchain monitoring
        </p>
      </div>

      {/* Download Progress */}
      {downloadProgress && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader className="w-5 h-5 text-bitcoin animate-spin" />
            <h3 className="font-semibold text-white">Downloading Bitcoin Core</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-bitcoin h-2 rounded-full transition-all duration-300" 
              style={{ width: `${downloadProgress.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">{downloadProgress.status}</p>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button 
          onClick={handleDownloadBitcoin}
          disabled={isDownloading}
          className="bg-gradient-to-r from-bitcoin to-yellow-500 hover:from-yellow-500 hover:to-bitcoin disabled:opacity-50 disabled:cursor-not-allowed text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          {isDownloading ? (
            <Loader className="w-8 h-8 mx-auto mb-3 animate-spin" />
          ) : (
            <Download className="w-8 h-8 mx-auto mb-3" />
          )}
          <h3 className="font-semibold mb-2">
            {isDownloading ? 'Downloading...' : 'Install Bitcoin Core'}
          </h3>
          <p className="text-sm text-white/80">Download and install Bitcoin Core 29.0</p>
        </button>

        <button 
          onClick={handleStartMainnet}
          disabled={isStarting || isNodeRunning}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-bitcoin/50 disabled:opacity-50 disabled:cursor-not-allowed text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          {isStarting ? (
            <Loader className="w-8 h-8 mx-auto mb-3 animate-spin text-green-500" />
          ) : isNodeRunning ? (
            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-500" />
          ) : (
            <Play className="w-8 h-8 mx-auto mb-3 text-green-500" />
          )}
          <h3 className="font-semibold mb-2">
            {isStarting ? 'Starting...' : isNodeRunning ? 'Node Running' : 'Start Mainnet'}
          </h3>
          <p className="text-sm text-gray-400">Launch Bitcoin Core daemon (full node)</p>
        </button>

        <button 
          onClick={handleStartPruned}
          disabled={isStarting || isNodeRunning}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-bitcoin/50 disabled:opacity-50 disabled:cursor-not-allowed text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          {isStarting ? (
            <Loader className="w-8 h-8 mx-auto mb-3 animate-spin text-blue-500" />
          ) : (
            <Settings className="w-8 h-8 mx-auto mb-3 text-blue-500" />
          )}
          <h3 className="font-semibold mb-2">
            {isStarting ? 'Starting...' : 'Start Pruned'}
          </h3>
          <p className="text-sm text-gray-400">Launch pruned node (saves disk space)</p>
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Node Status */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-bitcoin/20 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-bitcoin" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Node Status</h3>
                <p className="text-sm text-gray-400">Bitcoin Core Daemon</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isNodeRunning ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="text-sm text-gray-400">{nodeStatus}</span>
              <button 
                onClick={checkNodeStatus}
                className="text-bitcoin hover:text-yellow-500 transition-colors ml-2"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Blockchain Sync</span>
              </div>
              <span className="text-sm text-gray-400">
                {isNodeRunning ? 'Syncing...' : 'Not Started'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Network</span>
              </div>
              <span className="text-sm text-gray-400">
                {isNodeRunning ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Peers</span>
              </div>
              <span className="text-sm text-gray-400">
                {isNodeRunning ? 'Connecting...' : '0 connections'}
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Overview */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Wallet</h3>
                <p className="text-sm text-gray-400">Bitcoin Wallet</p>
              </div>
            </div>
            <button className="text-bitcoin hover:text-yellow-500 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center py-8">
              <Wallet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">No Wallet Loaded</h4>
              <p className="text-sm text-gray-400 mb-4">
                Create a new wallet or load an existing one to get started
              </p>
              <div className="space-y-2">
                <button className="w-full bg-bitcoin hover:bg-yellow-500 text-white py-2 px-4 rounded-lg transition-colors">
                  Create New Wallet
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Load Existing Wallet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installation Guide */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Getting Started</h3>
            <p className="text-sm text-gray-400">Follow these steps to set up Bitcoin Core</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-bitcoin/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-bitcoin font-semibold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Download Bitcoin Core</h4>
              <p className="text-sm text-gray-400 mb-2">
                Download the latest Bitcoin Core 28.2 for your operating system
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <HardDrive className="w-3 h-3" />
                <span>~500GB disk space required for full node</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-gray-500 font-semibold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Configure Settings</h4>
              <p className="text-sm text-gray-400 mb-2">
                Set up bitcoin.conf file and configure network settings
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Initial sync may take 6-24 hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-gray-500 font-semibold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Start Node</h4>
              <p className="text-sm text-gray-400">
                Launch Bitcoin Core daemon and begin blockchain synchronization
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Blocks</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Peers</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">0.00</div>
          <div className="text-sm text-gray-400">BTC Balance</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Transactions</div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinPage; 