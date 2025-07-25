import React, { useState, useEffect } from 'react';
import { TauriService } from '../services/tauri';
import { useNotifications } from '../hooks/useNotifications';
import { Play, Square, Download, Activity, Zap, Settings, Monitor, HardDrive, Cpu } from 'lucide-react';
import MiningRiskWarning from '../components/Common/MiningRiskWarning';

const WhivePage: React.FC = () => {
  const { addNotification } = useNotifications();
  
  // Node states
  const [isNodeRunning, setIsNodeRunning] = useState(false);
  const [nodeStatus, setNodeStatus] = useState('Not Running');
  const [useQt, setUseQt] = useState(false);
  
  // Mining states
  const [whiveAddress, setWhiveAddress] = useState('');
  const [threads, setThreads] = useState(2); // Changed from 4 to 2 to match example
  const [intensity, setIntensity] = useState(85);
  const [isMining, setIsMining] = useState(false);
  const [miningStats, setMiningStats] = useState<any>(null);
  
  // Loading states
  const [isDownloading, setIsDownloading] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<any>(null);

  // Risk warning states
  const [showRiskWarning, setShowRiskWarning] = useState(false);
  const [hasAcceptedRisks, setHasAcceptedRisks] = useState(false);

  useEffect(() => {
    checkNodeStatus();
    updateMiningStats();
    
    // Set up periodic updates
    const interval = setInterval(() => {
      if (isNodeRunning) checkNodeStatus();
      if (isMining) updateMiningStats();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isNodeRunning, isMining]);

  const checkNodeStatus = async () => {
    try {
      const status = await TauriService.getNodeStatus('whive_node');
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
      const stats = await TauriService.getMiningStatus('whive');
      setMiningStats(stats);
    } catch (error) {
      console.error('Failed to update mining stats:', error);
    }
  };

  const handleDownloadWhive = async () => {
    setIsDownloading(true);
    setDownloadProgress({ progress: 0, status: 'Starting download...' });
    
    try {
      addNotification('info', 'Whive Core Download', 'Starting Whive Core download...');

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

      const result = await TauriService.runWhiveNode(useQt);
      
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
      const result = await TauriService.stopNode('whive_node');
      addNotification('success', 'Node Stopped', result);
      setIsNodeRunning(false);
      setNodeStatus('Not Running');
    } catch (error) {
      addNotification('error', 'Failed to Stop Node', error as string);
    }
  };

  const handleStartMining = async () => {
    if (!whiveAddress.trim()) {
      addNotification('error', 'Missing Address', 'Please enter a Whive address to receive mining rewards.');
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
      addNotification('info', 'Validating Address', 'Checking Whive address format...');
      
      const isValid = await TauriService.validateWhiveAddress(whiveAddress.trim());
      if (!isValid) {
        addNotification('error', 'Invalid Address', 'Please enter a valid Whive address format.');
        return;
      }

      addNotification('info', 'Starting Mining', 'Initializing Whive Yespower mining...');

      const result = await TauriService.startEnhancedWhiveMining(
        whiveAddress.trim(),
        threads,
        intensity
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
      const result = await TauriService.stopMining('whive');
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Whive Mining & Node Management
          </h1>
          <p className="text-slate-400 text-lg">Yespower CPU Mining with Optimized Performance</p>
          
          {/* Mining Safety Notice */}
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4 mt-4">
            <p className="text-sm text-slate-300">
              ⚠️ <strong>Safety Notice:</strong> CPU mining generates significant heat and power consumption. 
              Monitor temperatures closely and ensure adequate cooling to prevent hardware damage.
            </p>
          </div>
        </div>

        {/* Node Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Whive Core Installation */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <Download className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Whive Core Setup</h2>
            </div>
            
            {downloadProgress && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>{downloadProgress.status}</span>
                  <span>{downloadProgress.progress}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress.progress}%` }}
                  />
                </div>
              </div>
            )}
            
            <button
              onClick={handleDownloadWhive}
              disabled={isDownloading}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Downloading...' : 'Download & Install Whive Core'}</span>
            </button>
          </div>

          {/* Node Control */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center space-x-3 mb-4">
              <Monitor className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Node Control</h2>
            </div>
            
            <div className="space-y-4">
              {/* Interface Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Interface</label>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setUseQt(false)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      !useQt 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    whived (Daemon)
                  </button>
                  <button
                    onClick={() => setUseQt(true)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                      useQt 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    whive-qt (GUI)
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
            <Zap className="w-5 h-5 text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">Whive Mining Configuration</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mining Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Whive Address <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={whiveAddress}
                  onChange={(e) => setWhiveAddress(e.target.value)}
                  placeholder="WmBRGi5VzVTmCHt6Rj1TGBh5s2QtJJkKKN"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    CPU Threads ({threads})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="16"
                    value={threads}
                    onChange={(e) => setThreads(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>1</span>
                    <span>16</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Mining Intensity ({intensity}%)
                  </label>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={intensity}
                    onChange={(e) => setIntensity(Number(e.target.value))}
                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mining Information */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg space-y-3">
                <h3 className="text-lg font-semibold text-white">Yespower Algorithm</h3>
                <div className="space-y-2 text-sm text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Algorithm:</span>
                    <span className="text-purple-400 font-mono">Yespower 1.0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Block Time:</span>
                    <span className="text-white">2.5 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CPU Optimized:</span>
                    <span className="text-green-400">Yes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ASIC Resistant:</span>
                    <span className="text-green-400">Yes</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-700/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">Performance Tips</h4>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Use 50-75% of available CPU cores</li>
                  <li>• Monitor CPU temperature (keep under 80°C)</li>
                  <li>• Close unnecessary applications</li>
                  <li>• Ensure adequate system cooling</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mining Controls */}
          <div className="mt-6 flex justify-center space-x-4">
            {/* Simple Test Button - Like Python Script */}
            <button
              onClick={async () => {
                if (!whiveAddress.trim()) {
                  addNotification('error', 'Missing Address', 'Please enter a Whive address.');
                  return;
                }
                try {
                  const result = await TauriService.startSimpleWhiveMining(whiveAddress.trim(), threads);
                  addNotification('success', 'Mining Started in Terminal', result);
                } catch (error) {
                  addNotification('error', 'Mining Failed', error as string);
                }
              }}
              disabled={!whiveAddress}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Play className="w-5 h-5" />
              <span>🧪 Test Simple Mining (Terminal)</span>
            </button>

            {/* Original Button */}
            {!isMining ? (
              <button
                onClick={handleStartMining}
                disabled={isStarting || !whiveAddress}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>{isStarting ? 'Starting Mining...' : 'Start Whive Mining'}</span>
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
              <Activity className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Mining Statistics</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Cpu className="w-4 h-4 text-purple-400" />
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
          miningType="whive"
          onAccept={handleAcceptRisks}
          onDecline={handleDeclineRisks}
        />
      </div>
    </div>
  );
};

export default WhivePage; 