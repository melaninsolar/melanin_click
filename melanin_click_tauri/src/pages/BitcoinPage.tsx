import React, { useState, useEffect } from 'react';
import { TauriService } from '../services/tauri';
import { useNotifications } from '../hooks/useNotifications';
import { Play, Square, Download, Activity, Zap, Monitor, HardDrive, Cpu } from 'lucide-react';
import MiningRiskWarning from '../components/Common/MiningRiskWarning';

const BitcoinPage: React.FC = () => {
  const { addNotification } = useNotifications();
  
  // Node states
  const [isNodeRunning, setIsNodeRunning] = useState(false);
  const [nodeStatus, setNodeStatus] = useState('Not Running');
  const [nodeType, setNodeType] = useState<'mainnet' | 'pruned'>('mainnet');
  const [useQt, setUseQt] = useState(false);
  
  // Mining states
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [workerName, setWorkerName] = useState('waka'); // Changed from melanin_worker to match example
  const [selectedPool, setSelectedPool] = useState('Public Pool'); // Changed from CKPool Solo to Public Pool
  const [miningMode, setMiningMode] = useState<'cpu' | 'stick'>('cpu');
  const [threads, setThreads] = useState(1);
  const [isMining, setIsMining] = useState(false);
  const [miningStats, setMiningStats] = useState<any>(null);
  
  // Available pools with enhanced information
  const [availablePools, setAvailablePools] = useState<any[]>([]);
  
  // Loading states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<any>(null);

  // Risk warning states
  const [showRiskWarning, setShowRiskWarning] = useState(false);
  const [hasAcceptedRisks, setHasAcceptedRisks] = useState(false);

  useEffect(() => {
    loadMiningPools();
    checkNodeStatus();
    updateMiningStats();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      if (isNodeRunning) checkNodeStatus();
      if (isMining) updateMiningStats();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isNodeRunning, isMining]);

  const loadMiningPools = async () => {
    try {
      const pools = await TauriService.getMiningPools();
      const bitcoinPools = pools.filter(pool => pool.algorithm === 'SHA-256');
      setAvailablePools(bitcoinPools);
    } catch (error) {
      console.error('Failed to load mining pools:', error);
    }
  };

  const checkNodeStatus = async () => {
    try {
      const status = await TauriService.getNodeStatus('bitcoin_mainnet');
      setIsNodeRunning(status.is_running);
      if (status.is_running) {
        setNodeStatus(`Synced ${status.sync_progress.toFixed(1)}% - Block ${status.block_height} - ${status.peer_count} peers`);
      } else {
        setNodeStatus('Not Running');
      }
    } catch (error) {
      setIsNodeRunning(false);
      setNodeStatus('Not Running');
    }
  };

  const updateMiningStats = async () => {
    try {
      const stats = await TauriService.getMiningStatus('bitcoin');
      setMiningStats(stats);
    } catch (error) {
      console.error('Failed to update mining stats:', error);
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

  const handleStartNode = async () => {
    setIsStarting(true);
    try {
      const nodeTypeStr = nodeType === 'mainnet' ? 'mainnet' : 'pruned';
      addNotification('info', 'Starting Bitcoin Node', `Launching Bitcoin Core ${nodeTypeStr} node...`);

      const result = nodeType === 'mainnet' 
        ? await TauriService.runBitcoinMainnet(useQt)
        : await TauriService.runBitcoinPruned(useQt);
      
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

  const handleStopNode = async () => {
    try {
      const result = await TauriService.stopNode('bitcoin_mainnet');
      addNotification('success', 'Node Stopped', result);
      setIsNodeRunning(false);
      setNodeStatus('Not Running');
    } catch (error) {
      addNotification('error', 'Failed to Stop Node', error as string);
    }
  };

  const handleStartBitcoinMining = async () => {
    if (!bitcoinAddress.trim()) {
      addNotification('error', 'Missing Address', 'Please enter a Bitcoin address to receive mining rewards.');
      return;
    }

    // Check if mining executables are installed first
    try {
      const minersInstalled = await TauriService.checkFileExists('~/melanin_miners');
      if (!minersInstalled) {
        addNotification('error', 'Mining Setup Required', 'Please install mining executables first. Go to Settings → Download Mining Executables.');
        return;
      }
    } catch (error) {
      addNotification('error', 'Setup Check Failed', 'Could not verify mining setup. Please check Settings page.');
      return;
    }

    // Show risk warning if not already accepted
    if (!hasAcceptedRisks) {
      setShowRiskWarning(true);
      return;
    }

    await startMiningProcess();
  };

  const startMiningProcess = async () => {
    setIsStarting(true);
    try {
      addNotification('info', 'Validating Address', 'Checking Bitcoin address format...');
      const isValid = await TauriService.validateBitcoinAddress(bitcoinAddress.trim());
      if (!isValid) {
        addNotification('error', 'Invalid Address', 'Please enter a valid Bitcoin address (legacy, segwit, or bech32).');
        return;
      }

      addNotification('info', 'Starting Bitcoin Mining', `Connecting to ${selectedPool} with ${miningMode.toUpperCase()} mining...`);

      const result = await TauriService.startEnhancedBitcoinMining(
        bitcoinAddress.trim(),
        workerName,
        selectedPool,
        miningMode === 'cpu' ? threads : undefined,
        miningMode
      );
      
      addNotification('success', 'Mining Started', result);
      setIsMining(true);
      updateMiningStats();
      
    } catch (error) {
      addNotification('error', 'Mining Failed', error as string);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStopMining = async () => {
    try {
      const result = await TauriService.stopMining('bitcoin');
      addNotification('success', 'Mining Stopped', result);
      setIsMining(false);
      setMiningStats(null);
    } catch (error) {
      addNotification('error', 'Failed to Stop Mining', error as string);
    }
  };

  const handleAcceptRisks = () => {
    setHasAcceptedRisks(true);
    setShowRiskWarning(false);
    addNotification('success', 'Risks Acknowledged', 'You have accepted mining risks. Starting mining process...');
    // Automatically start mining after accepting risks
    setTimeout(() => {
      startMiningProcess();
    }, 1000);
  };

  const handleDeclineRisks = () => {
    setShowRiskWarning(false);
    addNotification('info', 'Mining Cancelled', 'Mining operation cancelled. Risks must be acknowledged to proceed.');
  };

  const selectedPoolInfo = availablePools.find(pool => pool.name === selectedPool);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Bitcoin Mining & Node Management
          </h1>
          <p className="text-slate-400 text-lg">SHA-256 Mining with Professional Pool Connectivity</p>
          
          {/* Mining Safety Notice */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
            <p className="text-sm text-slate-300">
              ⚠️ <strong>Safety Notice:</strong> Cryptocurrency mining involves significant risks to hardware, 
              electrical systems, and finances. Always ensure proper cooling, electrical capacity, and 
              risk management before proceeding.
            </p>
          </div>
        </div>

        {/* Node Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bitcoin Core Installation */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Bitcoin Core Setup</h2>
            </div>
            
            {downloadProgress && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>{downloadProgress.status}</span>
                  <span>{downloadProgress.progress}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={handleDownloadBitcoin}
              disabled={isDownloading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Downloading...' : 'Download & Install Bitcoin Core'}</span>
            </button>
          </div>

          {/* Node Control */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <Monitor className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Node Control</h2>
            </div>
            
            <div className="space-y-4">
              {/* Node Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Node Type</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setNodeType('mainnet')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      nodeType === 'mainnet' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Full Node
                  </button>
                  <button
                    onClick={() => setNodeType('pruned')}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      nodeType === 'pruned' 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    Pruned (550MB)
                  </button>
                </div>
              </div>

              {/* Interface Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Interface</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setUseQt(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      !useQt 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    bitcoind (Daemon)
                  </button>
                  <button
                    onClick={() => setUseQt(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      useQt 
                        ? 'bg-orange-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    bitcoin-qt (GUI)
                  </button>
                </div>
              </div>

              {/* Node Status */}
              <div className="p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Status:</span>
                  <span className={`text-sm font-medium ${isNodeRunning ? 'text-green-400' : 'text-slate-400'}`}>
                    {nodeStatus}
                  </span>
                </div>
              </div>

              {/* Node Controls */}
              <div className="flex space-x-3">
                {!isNodeRunning ? (
                  <button
                    onClick={handleStartNode}
                    disabled={isStarting}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>{isStarting ? 'Starting...' : 'Start Node'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopNode}
                    className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <Square className="w-4 h-4" />
                    <span>Stop Node</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mining Configuration */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-5 h-5 text-orange-400" />
            <h2 className="text-2xl font-semibold text-white">Bitcoin Mining Configuration</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mining Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bitcoin Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={bitcoinAddress}
                  onChange={(e) => setBitcoinAddress(e.target.value)}
                  placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Worker Name</label>
                  <input
                    type="text"
                    value={workerName}
                    onChange={(e) => setWorkerName(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Mining Mode</label>
                  <select
                    value={miningMode}
                    onChange={(e) => setMiningMode(e.target.value as 'cpu' | 'stick')}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  >
                    <option value="cpu">CPU Mining</option>
                    <option value="stick">USB Stick Miner</option>
                  </select>
                </div>
              </div>

              {miningMode === 'cpu' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CPU Threads ({threads})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={threads}
                    onChange={(e) => setThreads(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1</span>
                    <span>8</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pool Selection */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mining Pool</label>
                <select
                  value={selectedPool}
                  onChange={(e) => setSelectedPool(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                >
                  {availablePools.map(pool => (
                    <option key={pool.name} value={pool.name}>
                      {pool.name} - {pool.fee}% fee
                    </option>
                  ))}
                </select>
              </div>

              {/* Pool Information */}
              {selectedPoolInfo && (
                <div className="p-4 bg-slate-700/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Pool URL:</span>
                    <span className="text-sm font-mono text-orange-400">{selectedPoolInfo.url}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Fee:</span>
                    <span className="text-sm text-white">{selectedPoolInfo.fee}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Location:</span>
                    <span className="text-sm text-white">{selectedPoolInfo.location}</span>
                  </div>
                  {selectedPoolInfo.latency && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">Latency:</span>
                      <span className="text-sm text-green-400">{selectedPoolInfo.latency}ms</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-400 mt-2">{selectedPoolInfo.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Mining Controls */}
          <div className="mt-6 flex justify-center space-x-4">
            {/* Simple Test Button - Like Python Script */}
            <button
              onClick={async () => {
                if (!bitcoinAddress.trim()) {
                  addNotification('error', 'Missing Address', 'Please enter a Bitcoin address.');
                  return;
                }
                try {
                  const result = await TauriService.startSimpleBitcoinMining(bitcoinAddress.trim(), workerName);
                  addNotification('success', 'Mining Started in Terminal', result);
                } catch (error) {
                  addNotification('error', 'Mining Failed', error as string);
                }
              }}
              disabled={!bitcoinAddress}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>🧪 Test Simple Mining (Terminal)</span>
            </button>

            {/* Original Button */}
            {!isMining ? (
              <button
                onClick={handleStartBitcoinMining}
                disabled={isStarting || !bitcoinAddress}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>{isStarting ? 'Starting Mining...' : 'Start Bitcoin Mining'}</span>
              </button>
            ) : (
              <button
                onClick={handleStopMining}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Square className="w-5 h-5" />
                <span>Stop Mining</span>
              </button>
            )}
          </div>
        </div>

        {/* Mining Statistics */}
        {miningStats && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-orange-400" />
              <h2 className="text-xl font-semibold text-white">Mining Statistics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="w-4 h-4 text-orange-400" />
                  <span className="text-sm text-slate-300">Hashrate</span>
                </div>
                <span className="text-2xl font-bold text-white">{miningStats.hashrate.toFixed(2)} H/s</span>
              </div>
              
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-slate-300">Accepted Shares</span>
                </div>
                <span className="text-2xl font-bold text-white">{miningStats.accepted_shares}</span>
              </div>
              
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <HardDrive className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-slate-300">Temperature</span>
                </div>
                <span className="text-2xl font-bold text-white">{miningStats.temperature.toFixed(1)}°C</span>
              </div>
              
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-slate-300">Power Usage</span>
                </div>
                <span className="text-2xl font-bold text-white">{miningStats.power_consumption.toFixed(1)}W</span>
              </div>
            </div>
          </div>
        )}

        {/* Mining Risk Warning Modal */}
        <MiningRiskWarning
          isOpen={showRiskWarning}
          miningType="bitcoin"
          onAccept={handleAcceptRisks}
          onDecline={handleDeclineRisks}
        />
      </div>
    </div>
  );
};

export default BitcoinPage; 