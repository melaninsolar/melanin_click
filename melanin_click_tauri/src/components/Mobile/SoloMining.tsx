import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Zap, Settings, BarChart3, Play, Square, XCircle } from 'lucide-react'

interface SoloMiningConfig {
  bitcoin_rpc_url: string
  bitcoin_rpc_user: string
  bitcoin_rpc_password: string
  whive_rpc_url: string
  whive_rpc_user: string
  whive_rpc_password: string
  mining_address: string
  cryptocurrency: string
}

interface SoloMiningStats {
  is_active: boolean
  current_block_height: number
  difficulty: number
  network_hashrate: string
  blocks_found: number
  mining_address: string
}

interface BlockTemplate {
  version: number
  previous_block_hash: string
  transactions: string[]
  coinbase_value: number
  target: string
  min_time: number
  cur_time: number
  bits: string
  height: number
}

export default function SoloMining() {
  const [config, setConfig] = useState<SoloMiningConfig>({
    bitcoin_rpc_url: 'http://127.0.0.1:8332',
    bitcoin_rpc_user: '',
    bitcoin_rpc_password: '',
    whive_rpc_url: 'http://127.0.0.1:9332',
    whive_rpc_user: '',
    whive_rpc_password: '',
    mining_address: '',
    cryptocurrency: 'bitcoin',
  })
  const [stats, setStats] = useState<SoloMiningStats | null>(null)
  const [blockTemplate, setBlockTemplate] = useState<BlockTemplate | null>(null)
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfig, setShowConfig] = useState(true)

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 10000) // Update every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const loadStats = async () => {
    try {
      const currentStats = await invoke<SoloMiningStats>('get_solo_mining_stats')
      setStats(currentStats)
      
      if (currentStats.is_active) {
        setShowConfig(false)
        setIsConfigured(true)
      }
    } catch (error) {
      console.error('Failed to load solo mining stats:', error)
    }
  }

  const configureSoloMining = async () => {
    if (!config.mining_address.trim()) {
      setError('Mining address is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await invoke('configure_solo_mining', { config })
      setIsConfigured(true)
      setShowConfig(false)
      await loadStats()
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const startSoloMining = async () => {
    setLoading(true)
    setError(null)

    try {
      await invoke('start_solo_mining')
      await loadStats()
      
      // Get initial block template
      const template = await invoke<BlockTemplate>('get_solo_block_template')
      setBlockTemplate(template)
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const stopSoloMining = async () => {
    setLoading(true)
    try {
      await invoke('stop_solo_mining')
      await loadStats()
      setBlockTemplate(null)
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const getBlockTemplate = async () => {
    try {
      const template = await invoke<BlockTemplate>('get_solo_block_template')
      setBlockTemplate(template)
    } catch (error) {
      setError(error as string)
    }
  }

  if (showConfig || !isConfigured) {
    return (
      <div className="space-y-6 p-4 max-w-md mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-white">Solo Mining Setup</h2>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg flex items-center space-x-2">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cryptocurrency
            </label>
            <select
              value={config.cryptocurrency}
              onChange={(e) => setConfig({ ...config, cryptocurrency: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="bitcoin">Bitcoin</option>
              <option value="whive">Whive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mining Address
            </label>
            <input
              type="text"
              value={config.mining_address}
              onChange={(e) => setConfig({ ...config, mining_address: e.target.value })}
              placeholder={config.cryptocurrency === 'bitcoin' ? 'bc1q...' : 'WS1q...'}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              RPC Username
            </label>
            <input
              type="text"
              value={config.cryptocurrency === 'bitcoin' ? config.bitcoin_rpc_user : config.whive_rpc_user}
              onChange={(e) => {
                if (config.cryptocurrency === 'bitcoin') {
                  setConfig({ ...config, bitcoin_rpc_user: e.target.value })
                } else {
                  setConfig({ ...config, whive_rpc_user: e.target.value })
                }
              }}
              placeholder="rpc_username"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              RPC Password
            </label>
            <input
              type="password"
              value={config.cryptocurrency === 'bitcoin' ? config.bitcoin_rpc_password : config.whive_rpc_password}
              onChange={(e) => {
                if (config.cryptocurrency === 'bitcoin') {
                  setConfig({ ...config, bitcoin_rpc_password: e.target.value })
                } else {
                  setConfig({ ...config, whive_rpc_password: e.target.value })
                }
              }}
              placeholder="rpc_password"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              RPC URL
            </label>
            <input
              type="text"
              value={config.cryptocurrency === 'bitcoin' ? config.bitcoin_rpc_url : config.whive_rpc_url}
              onChange={(e) => {
                if (config.cryptocurrency === 'bitcoin') {
                  setConfig({ ...config, bitcoin_rpc_url: e.target.value })
                } else {
                  setConfig({ ...config, whive_rpc_url: e.target.value })
                }
              }}
              placeholder="http://127.0.0.1:8332"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={configureSoloMining}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Settings className="h-5 w-5" />
                <span>Configure Solo Mining</span>
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-white">Solo Mining</h2>
        </div>
        <button
          onClick={() => setShowConfig(true)}
          className="text-gray-400 hover:text-white"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg flex items-center space-x-2">
          <XCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Mining Status */}
      {stats && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Mining Status</span>
            <div className={`px-3 py-1 rounded-full text-sm ${
              stats.is_active ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            }`}>
              {stats.is_active ? 'Active' : 'Stopped'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Block Height:</span>
              <span className="text-white ml-2">{stats.current_block_height.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-400">Blocks Found:</span>
              <span className="text-white ml-2">{stats.blocks_found}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Network Hashrate:</span>
              <span className="text-white ml-2">{stats.network_hashrate}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400">Difficulty:</span>
              <span className="text-white ml-2">{stats.difficulty.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Block Template Info */}
      {blockTemplate && (
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white font-medium">Current Block Template</span>
            <button
              onClick={getBlockTemplate}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              Refresh
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Height:</span>
              <span className="text-white">{blockTemplate.height.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Coinbase Value:</span>
              <span className="text-white">{(blockTemplate.coinbase_value / 100000000).toFixed(8)} BTC</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Transactions:</span>
              <span className="text-white">{blockTemplate.transactions.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Previous Hash:</span>
              <div className="text-white text-xs mt-1 break-all font-mono">
                {blockTemplate.previous_block_hash}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mining Controls */}
      <div className="space-y-3">
        {stats?.is_active ? (
          <button
            onClick={stopSoloMining}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Square className="h-5 w-5" />
                <span>Stop Solo Mining</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={startSoloMining}
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Play className="h-5 w-5" />
                <span>Start Solo Mining</span>
              </>
            )}
          </button>
        )}

        {!stats?.is_active && (
          <button
            onClick={getBlockTemplate}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Get Block Template</span>
          </button>
        )}
      </div>

      {/* Mining Address Display */}
      {stats?.mining_address && (
        <div className="bg-gray-800 rounded-lg p-4">
          <span className="text-gray-400 text-sm">Mining to:</span>
          <div className="text-white text-sm mt-1 break-all font-mono">
            {stats.mining_address}
          </div>
        </div>
      )}
    </div>
  )
}