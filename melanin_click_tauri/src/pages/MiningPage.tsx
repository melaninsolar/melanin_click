import React, { useState, useEffect } from 'react';
import { Zap, Settings, TrendingUp, Cpu, Thermometer, Battery, DollarSign, Clock, Target, Award, Globe, ChevronDown, ChevronUp, Loader } from 'lucide-react';
import { TauriService } from '../services/tauri';
import { useNotifications } from '../hooks/useNotifications';
import { MiningStats } from '../types';

const MiningPage: React.FC = () => {
  const [activeMiner, setActiveMiner] = useState<'none' | 'bitcoin' | 'whive'>('none');
  const [showPoolSettings, setShowPoolSettings] = useState(false);
  const [bitcoinAddress, setBitcoinAddress] = useState('');
  const [whiveAddress, setWhiveAddress] = useState('');
  const [workerName, setWorkerName] = useState('worker1');
  const [selectedPool, setSelectedPool] = useState('CKPool');
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotifications();

  useEffect(() => {
    if (activeMiner !== 'none') {
      const interval = setInterval(updateMiningStats, 5000);
      return () => clearInterval(interval);
    }
  }, [activeMiner]);

  const updateMiningStats = async () => {
    try {
      const miningType = activeMiner === 'bitcoin' ? 'bitcoin' : 'whive';
      const stats = await TauriService.getRealMiningStats(miningType);
      setMiningStats(stats);
    } catch (error) {
      console.error('Failed to update mining stats:', error);
    }
  };

  const handleStartBitcoinMining = async () => {
    if (!bitcoinAddress.trim()) {
      addNotification('error', 'Mining Error', 'Please enter a valid Bitcoin address');
      return;
    }

    setIsLoading(true);
    try {
      // Validate address first
      addNotification('info', 'Validating Address', 'Checking Bitcoin address format...');
      const isValid = await TauriService.validateBitcoinAddress(bitcoinAddress.trim());
      if (!isValid) {
        addNotification('error', 'Invalid Address', 'Please enter a valid Bitcoin address');
        return;
      }

      addNotification('info', 'Starting Bitcoin Mining', 'Initializing Bitcoin mining...');
      const result = await TauriService.startEnhancedBitcoinMining(
        bitcoinAddress.trim(), 
        workerName, 
        selectedPool,
        2 // Default to 2 threads
      );
      addNotification('success', 'Bitcoin Mining Started', result);
      setActiveMiner('bitcoin');
      updateMiningStats();
    } catch (error) {
      addNotification('error', 'Bitcoin Mining Failed', error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartWhiveMining = async () => {
    if (!whiveAddress.trim()) {
      addNotification('error', 'Mining Error', 'Please enter a valid Whive address');
      return;
    }

    setIsLoading(true);
    try {
      // Validate address first
      addNotification('info', 'Validating Address', 'Checking Whive address format...');
      const isValid = await TauriService.validateWhiveAddress(whiveAddress.trim());
      if (!isValid) {
        addNotification('error', 'Invalid Address', 'Please enter a valid Whive address');
        return;
      }

      addNotification('info', 'Starting Whive Mining', 'Initializing Whive mining...');
      const result = await TauriService.startEnhancedWhiveMining(
        whiveAddress.trim(),
        4, // Default to 4 threads for CPU mining
        80 // Default intensity
      );
      addNotification('success', 'Whive Mining Started', result);
      setActiveMiner('whive');
      updateMiningStats();
    } catch (error) {
      addNotification('error', 'Whive Mining Failed', error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopMining = async () => {
    setIsLoading(true);
    try {
      const result = await TauriService.stopMining();
      addNotification('success', 'Mining Stopped', result);
      setActiveMiner('none');
      setMiningStats(null);
    } catch (error) {
      addNotification('error', 'Failed to Stop Mining', error as string);
    } finally {
      setIsLoading(false);
    }
  };

  const miningPools = [
    { name: 'Whive Pool', url: 'stratum+tcp://pool.whive.io:3333', fee: '1%', location: 'Global' },
    { name: 'Mining Pool Hub', url: 'stratum+tcp://hub.miningpoolhub.com:20569', fee: '0.9%', location: 'US/EU/Asia' },
    { name: 'Suprnova', url: 'stratum+tcp://whive.suprnova.cc:7777', fee: '1%', location: 'Global' },
  ];

  return (
    <div className="container mx-auto px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Mining Operations</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Professional cryptocurrency mining with optimized hardware utilization
        </p>
      </div>

      {/* Mining Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Mining Control</h3>
                  <p className="text-sm text-gray-400">Select mining operation</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${activeMiner === 'none' ? 'bg-gray-500' : 'bg-green-500 animate-pulse'}`}></div>
                <span className="text-sm text-gray-400">
                  {activeMiner === 'none' ? 'Idle' : activeMiner === 'bitcoin' ? 'Bitcoin Mining' : 'Whive Mining'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                  onClick={activeMiner === 'bitcoin' ? handleStopMining : () => {
                    if (!bitcoinAddress.trim()) {
                      addNotification('error', 'Mining Error', 'Please enter a Bitcoin address in the pool settings below');
                      setShowPoolSettings(true);
                    } else {
                      handleStartBitcoinMining();
                    }
                  }}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border transition-all ${
                    activeMiner === 'bitcoin' 
                      ? 'bg-bitcoin/20 border-bitcoin text-bitcoin' 
                      : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:border-bitcoin/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-bitcoin/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-bitcoin" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Bitcoin Mining</h4>
                      <p className="text-xs text-gray-400">SHA-256 Algorithm</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm mb-1">Status: {activeMiner === 'bitcoin' ? 'Active' : 'Stopped'}</p>
                    <p className="text-xs text-gray-400">Hashrate: 0 TH/s</p>
                  </div>
                </button>

                <button 
                  onClick={activeMiner === 'whive' ? handleStopMining : () => {
                    if (!whiveAddress.trim()) {
                      addNotification('error', 'Mining Error', 'Please enter a Whive address in the pool settings below');
                      setShowPoolSettings(true);
                    } else {
                      handleStartWhiveMining();
                    }
                  }}
                  disabled={isLoading}
                  className={`p-4 rounded-lg border transition-all ${
                    activeMiner === 'whive' 
                      ? 'bg-whive/20 border-whive text-whive' 
                      : 'bg-gray-700/30 border-gray-600 text-gray-300 hover:border-whive/50'
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-whive/20 rounded-lg flex items-center justify-center">
                      <Cpu className="w-4 h-4 text-whive" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Whive Mining</h4>
                      <p className="text-xs text-gray-400">YescryptR32 Algorithm</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm mb-1">Status: {activeMiner === 'whive' ? 'Active' : 'Stopped'}</p>
                    <p className="text-xs text-gray-400">Hashrate: 0 H/s</p>
                  </div>
                </button>
              </div>

              {activeMiner !== 'none' && (
                <div className="bg-gray-700/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-white">Mining Pool Settings</h4>
                    <button
                      onClick={() => setShowPoolSettings(!showPoolSettings)}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {showPoolSettings ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                  
                  {showPoolSettings && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Bitcoin Address</label>
                          <input
                            type="text"
                            value={bitcoinAddress}
                            onChange={(e) => setBitcoinAddress(e.target.value)}
                            placeholder="Enter your Bitcoin wallet address"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-white mb-2">Whive Address</label>
                          <input
                            type="text"
                            value={whiveAddress}
                            onChange={(e) => setWhiveAddress(e.target.value)}
                            placeholder="Enter your Whive wallet address"
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-whive focus:border-transparent"
                          />
                        </div>
                      </div>
                      
                      {activeMiner === 'bitcoin' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Worker Name</label>
                            <input
                              type="text"
                              value={workerName}
                              onChange={(e) => setWorkerName(e.target.value)}
                              placeholder="worker1"
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Mining Pool</label>
                            <select
                              value={selectedPool}
                              onChange={(e) => setSelectedPool(e.target.value)}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-bitcoin focus:border-transparent"
                            >
                              <option value="CKPool">CKPool</option>
                              <option value="Public Pool">Public Pool</option>
                              <option value="Ocean Pool">Ocean Pool</option>
                              <option value="Ocean Pool (Alt)">Ocean Pool (Alt)</option>
                            </select>
                          </div>
                        </div>
                      )}

                      <div className="space-y-3">
                        <h5 className="text-sm font-medium text-white">Available Mining Pools</h5>
                        {miningPools.map((pool, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-600/30 rounded-lg">
                            <div>
                              <p className="font-medium text-white">{pool.name}</p>
                              <p className="text-xs text-gray-400">{pool.url}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-300">Fee: {pool.fee}</p>
                              <p className="text-xs text-gray-400">{pool.location}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-white">Hashrate</h4>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {miningStats ? `${miningStats.hashrate.toFixed(1)} H/s` : '0 H/s'}
            </div>
            <div className="text-sm text-gray-400">Current mining speed</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <Award className="w-5 h-5 text-yellow-500" />
              <h4 className="font-semibold text-white">Shares</h4>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {miningStats ? miningStats.accepted_shares : '0'}
            </div>
            <div className="text-sm text-gray-400">Accepted shares</div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
            <div className="flex items-center space-x-3 mb-3">
              <DollarSign className="w-5 h-5 text-green-500" />
              <h4 className="font-semibold text-white">Earnings</h4>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              ${miningStats ? miningStats.estimated_earnings.toFixed(4) : '0.00'}
            </div>
            <div className="text-sm text-gray-400">Estimated daily</div>
          </div>
        </div>
      </div>

      {/* Hardware Performance */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Cpu className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Hardware Performance</h3>
              <p className="text-sm text-gray-400">Real-time system monitoring</p>
            </div>
          </div>
          <button className="text-blue-500 hover:text-blue-400 transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Cpu className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-300">CPU Usage</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {activeMiner !== 'none' ? '75%' : '0%'}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: activeMiner !== 'none' ? '75%' : '0%' }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-gray-300">Temperature</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {miningStats ? `${miningStats.temperature.toFixed(1)}°C` : '--°C'}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ width: miningStats ? `${Math.min(miningStats.temperature / 80 * 100, 100)}%` : '0%' }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Battery className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-300">Power</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {miningStats ? `${miningStats.power_consumption.toFixed(0)}W` : '0W'}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: miningStats ? `${Math.min(miningStats.power_consumption / 200 * 100, 100)}%` : '0%' }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-300">Uptime</span>
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              {miningStats ? `${Math.floor(miningStats.uptime / 3600)}h` : '0h'}
            </div>
            <div className="w-full bg-gray-600 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: miningStats && miningStats.uptime > 0 ? '100%' : '0%' }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mining History */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Mining History</h3>
              <p className="text-sm text-gray-400">Recent mining activity</p>
            </div>
          </div>
        </div>

        <div className="text-center py-12">
          <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h4 className="font-semibold text-white mb-2">No Mining History</h4>
          <p className="text-sm text-gray-400 mb-6">
            Start mining to see your performance history and statistics
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={whiveAddress}
              onChange={(e) => setWhiveAddress(e.target.value)}
              placeholder="Enter Whive address to start mining"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-whive focus:border-transparent"
            />
            <button
              onClick={handleStartWhiveMining}
              disabled={isLoading || !whiveAddress.trim() || activeMiner !== 'none'}
              className="bg-gradient-to-r from-whive to-purple-500 hover:from-purple-500 hover:to-whive disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Starting...</span>
                </div>
              ) : activeMiner === 'whive' ? (
                'Whive Mining Active'
              ) : (
                'Start Whive Mining'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-yellow-500/50 text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105">
          <Settings className="w-8 h-8 mx-auto mb-3 text-yellow-500" />
          <h3 className="font-semibold mb-2">Pool Settings</h3>
          <p className="text-sm text-gray-400">Configure mining pools and addresses</p>
        </button>

        <button className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-green-500/50 text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105">
          <TrendingUp className="w-8 h-8 mx-auto mb-3 text-green-500" />
          <h3 className="font-semibold mb-2">Performance</h3>
          <p className="text-sm text-gray-400">Optimize mining performance</p>
        </button>

        <button className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-blue-500/50 text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105">
          <Globe className="w-8 h-8 mx-auto mb-3 text-blue-500" />
          <h3 className="font-semibold mb-2">Network</h3>
          <p className="text-sm text-gray-400">Check network connectivity</p>
        </button>
      </div>
    </div>
  );
};

export default MiningPage; 