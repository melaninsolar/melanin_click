import React, { useState, useEffect } from 'react';
import { Cpu, Download, Play, Pause, Activity, Thermometer, Zap, RefreshCw, Loader, CheckCircle, Database, Globe, TrendingUp, Battery, AlertCircle, HardDrive, Clock } from 'lucide-react';
import { TauriService } from '../services/tauri';
import { useNotifications } from '../hooks/useNotifications';
import { MiningStats } from '../types';

const WhivePage: React.FC = () => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isNodeRunning, setIsNodeRunning] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [nodeStatus, setNodeStatus] = useState<string>('Not Running');
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [whiveAddress, setWhiveAddress] = useState('');
  const [downloadProgress, setDownloadProgress] = useState<{progress: number, status: string} | null>(null);
  const { addNotification } = useNotifications();

  useEffect(() => {
    checkNodeStatus();
    if (isMining) {
      const interval = setInterval(updateMiningStats, 5000);
      return () => clearInterval(interval);
    }
  }, [isMining]);

  const checkNodeStatus = async () => {
    try {
      const status = await TauriService.checkWhiveStatus();
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

  const updateMiningStats = async () => {
    try {
      const stats = await TauriService.getRealMiningStats('whive');
      setMiningStats(stats);
    } catch (error) {
      console.error('Failed to update mining stats:', error);
    }
  };

  const handleDownloadWhive = async () => {
    setIsDownloading(true);
    setDownloadProgress({ progress: 0, status: 'Starting download...' });
    
    try {
      addNotification('info', 'Whive Download', 'Starting Whive download...');

      const result = await TauriService.downloadAndInstallWhive();
      
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

  const handleStartNode = async () => {
    setIsStarting(true);
    try {
      addNotification('info', 'Starting Whive Node', 'Launching Whive node...');

      const result = await TauriService.runWhiveNode();
      
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

  const handleStartMining = async () => {
    if (!whiveAddress.trim()) {
      addNotification('error', 'Mining Error', 'Please enter a valid Whive address');
      return;
    }

    try {
      // Validate address first
      addNotification('info', 'Validating Address', 'Checking Whive address format...');
      const isValid = await TauriService.validateWhiveAddress(whiveAddress.trim());
      if (!isValid) {
        addNotification('error', 'Invalid Address', 'Please enter a valid Whive address format');
        return;
      }

      addNotification('info', 'Starting Mining', 'Initializing Whive mining...');

      const result = await TauriService.startEnhancedWhiveMining(
        whiveAddress.trim(),
        4, // Use 4 threads for optimal CPU mining
        85 // High intensity for dedicated mining
      );
      
      addNotification('success', 'Mining Started', result);
      
      setIsMining(true);
      updateMiningStats();
      
    } catch (error) {
      addNotification('error', 'Mining Failed', error as string);
    }
  };

  const handleStopMining = async () => {
    try {
      const result = await TauriService.stopMining();
      
      addNotification('success', 'Mining Stopped', result);
      
      setIsMining(false);
      setMiningStats(null);
      
    } catch (error) {
      addNotification('error', 'Failed to Stop Mining', error as string);
    }
  };

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-whive to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Cpu className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Whive Protocol</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          CPU-optimized cryptocurrency mining with YescryptR32 algorithm
        </p>
      </div>

      {/* Download Progress */}
      {downloadProgress && (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Loader className="w-5 h-5 text-whive animate-spin" />
            <h3 className="font-semibold text-white">Downloading Whive</h3>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-whive h-2 rounded-full transition-all duration-300" 
              style={{ width: `${downloadProgress.progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">{downloadProgress.status}</p>
        </div>
      )}

      {/* Mining Controls */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-whive/20 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-whive" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Mining Operations</h3>
            <p className="text-sm text-gray-400">YescryptR32 CPU Mining</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Whive Address</label>
            <input
              type="text"
              value={whiveAddress}
              onChange={(e) => setWhiveAddress(e.target.value)}
              placeholder="Enter your Whive wallet address"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-whive focus:border-transparent"
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleStartMining}
              disabled={isMining || !whiveAddress.trim()}
              className="flex-1 bg-gradient-to-r from-whive to-purple-500 hover:from-purple-500 hover:to-whive disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <div className="flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>{isMining ? 'Mining Active' : 'Start Mining'}</span>
              </div>
            </button>

            <button
              onClick={handleStopMining}
              disabled={!isMining}
              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors"
            >
              <div className="flex items-center justify-center space-x-2">
                <Pause className="w-5 h-5" />
                <span>Stop Mining</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button 
          onClick={handleDownloadWhive}
          disabled={isDownloading}
          className="bg-gradient-to-r from-whive to-purple-500 hover:from-purple-500 hover:to-whive disabled:opacity-50 disabled:cursor-not-allowed text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          {isDownloading ? (
            <Loader className="w-8 h-8 mx-auto mb-3 animate-spin" />
          ) : (
            <Download className="w-8 h-8 mx-auto mb-3" />
          )}
          <h3 className="font-semibold mb-2">
            {isDownloading ? 'Downloading...' : 'Install Whive'}
          </h3>
          <p className="text-sm text-white/80">Download and install Whive 22.2.2</p>
        </button>

        <button 
          onClick={handleStartNode}
          disabled={isStarting || isNodeRunning}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-whive/50 disabled:opacity-50 disabled:cursor-not-allowed text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105"
        >
          {isStarting ? (
            <Loader className="w-8 h-8 mx-auto mb-3 animate-spin text-green-500" />
          ) : isNodeRunning ? (
            <CheckCircle className="w-8 h-8 mx-auto mb-3 text-green-500" />
          ) : (
            <Play className="w-8 h-8 mx-auto mb-3 text-green-500" />
          )}
          <h3 className="font-semibold mb-2">
            {isStarting ? 'Starting...' : isNodeRunning ? 'Node Running' : 'Start Node'}
          </h3>
          <p className="text-sm text-gray-400">Launch Whive Core daemon</p>
        </button>
      </div>

      {/* Performance & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Mining Performance */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Activity className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Node Status</h3>
                <p className="text-sm text-gray-400">Whive Daemon</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isNodeRunning ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="text-sm text-gray-400">{nodeStatus}</span>
              <button 
                onClick={checkNodeStatus}
                className="text-whive hover:text-purple-500 transition-colors ml-2"
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

        {/* Mining Status */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Mining Status</h3>
                <p className="text-sm text-gray-400">CPU Mining</p>
              </div>
            </div>
            <button className="text-whive hover:text-purple-500 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="text-center py-8">
              <Zap className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h4 className="font-semibold text-white mb-2">Mining Stopped</h4>
              <p className="text-sm text-gray-400 mb-4">
                Ready to start CPU mining with YescryptR32 algorithm
              </p>
              <div className="space-y-2">
                <button className="w-full bg-whive hover:bg-purple-500 text-white py-2 px-4 rounded-lg transition-colors">
                  Start Mining
                </button>
                <button className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                  Mining Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CPU Performance */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
            <Cpu className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <h3 className="font-semibold text-white">CPU Performance</h3>
            <p className="text-sm text-gray-400">Hardware optimization for Whive mining</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">CPU Usage</span>
              <span className="text-sm text-white font-semibold">0%</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full w-0 transition-all duration-300"></div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-300">Temperature</span>
              </div>
              <span className="text-sm text-white font-semibold">--°C</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full w-0 transition-all duration-300"></div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Battery className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-300">Power</span>
              </div>
              <span className="text-sm text-white font-semibold">0W</span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full w-0 transition-all duration-300"></div>
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
            <h3 className="font-semibold text-white">Getting Started with Whive</h3>
            <p className="text-sm text-gray-400">Follow these steps to set up Whive mining</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-whive/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-whive font-semibold text-sm">1</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Download Whive</h4>
              <p className="text-sm text-gray-400 mb-2">
                Download the latest Whive 22.2.3 for your operating system
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <HardDrive className="w-3 h-3" />
                <span>~50GB disk space required</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-gray-500 font-semibold text-sm">2</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Configure Mining</h4>
              <p className="text-sm text-gray-400 mb-2">
                Set up mining pool, wallet address, and CPU optimization
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Initial sync takes 2-6 hours</span>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-700/30 rounded-lg">
            <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-gray-500 font-semibold text-sm">3</span>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">Start Mining</h4>
              <p className="text-sm text-gray-400">
                Begin CPU mining with optimized YescryptR32 algorithm
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mining Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {miningStats ? `${miningStats.hashrate.toFixed(1)}` : '0'}
          </div>
          <div className="text-sm text-gray-400">H/s</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {miningStats ? miningStats.accepted_shares : '0'}
          </div>
          <div className="text-sm text-gray-400">Shares</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">0.00</div>
          <div className="text-sm text-gray-400">WHIVE Balance</div>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700 text-center">
          <div className="text-2xl font-bold text-white mb-1">0</div>
          <div className="text-sm text-gray-400">Blocks Found</div>
        </div>
      </div>
    </div>
  );
};

export default WhivePage; 