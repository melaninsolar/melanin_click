import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { 
  Smartphone, 
  Battery, 
  Thermometer, 
  Zap, 
  Settings, 
  Play, 
  Square, 
  Bell,
  Shield,
  Wifi,
  WifiOff
} from 'lucide-react'

interface MobileStats {
  battery_level: number
  is_charging: boolean
  temperature?: number
  mining_allowed: boolean
  background_service_active: boolean
  solo_mining_active: boolean
  foreground_service_active: boolean
}

interface MiningPerformance {
  hashrate: string
  blocks_found: number
  uptime_minutes: number
  estimated_daily_earnings: string
}

export default function MobileMiningDashboard() {
  const [stats, setStats] = useState<MobileStats>({
    battery_level: 0,
    is_charging: false,
    temperature: undefined,
    mining_allowed: false,
    background_service_active: false,
    solo_mining_active: false,
    foreground_service_active: false,
  })
  const [performance, setPerformance] = useState<MiningPerformance>({
    hashrate: '0 H/s',
    blocks_found: 0,
    uptime_minutes: 0,
    estimated_daily_earnings: '$0.00',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMobileStats()
    const interval = setInterval(loadMobileStats, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const loadMobileStats = async () => {
    try {
      const [batteryInfo, miningAllowed, lifecycleState, soloStats] = await Promise.all([
        invoke('get_battery_status').catch(() => ({ level: 0, is_charging: false, temperature: undefined })),
        invoke<boolean>('is_mobile_mining_allowed'),
        invoke('get_android_lifecycle_state').catch(() => ({ is_foreground: true, foreground_service_active: false })),
        invoke('get_solo_mining_stats').catch(() => ({ is_active: false, blocks_found: 0 }))
      ])

      setStats({
        battery_level: (batteryInfo as any)?.level || 0,
        is_charging: (batteryInfo as any)?.is_charging || false,
        temperature: (batteryInfo as any)?.temperature,
        mining_allowed: miningAllowed,
        background_service_active: !(lifecycleState as any).is_foreground && (lifecycleState as any).foreground_service_active,
        solo_mining_active: (soloStats as any).is_active,
        foreground_service_active: (lifecycleState as any).foreground_service_active,
      })

      // Update performance stats (simulated for now)
      if ((soloStats as any).is_active) {
        setPerformance({
          hashrate: '2.5 MH/s', // Simulated
          blocks_found: (soloStats as any).blocks_found || 0,
          uptime_minutes: Math.floor(Date.now() / 60000) % 1440, // Simulated
          estimated_daily_earnings: '$0.15', // Simulated
        })
      }
    } catch (error) {
      console.error('Failed to load mobile stats:', error)
    }
  }

  const toggleMining = async () => {
    setLoading(true)
    setError(null)

    try {
      if (stats.solo_mining_active) {
        await invoke('stop_solo_mining')
      } else {
        await invoke('start_solo_mining')
      }
      await loadMobileStats()
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const toggleBackgroundService = async () => {
    setLoading(true)
    setError(null)

    try {
      if (stats.foreground_service_active) {
        await invoke('stop_foreground_mining_service')
      } else {
        await invoke('start_foreground_mining_service')
      }
      await loadMobileStats()
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const requestBatteryOptimization = async () => {
    setLoading(true)
    try {
      const granted = await invoke<boolean>('request_disable_battery_optimization')
      if (granted) {
        await loadMobileStats()
      } else {
        setError('Battery optimization permission not granted')
      }
    } catch (error) {
      setError(error as string)
    } finally {
      setLoading(false)
    }
  }

  const getBatteryColor = () => {
    if (stats.is_charging) return 'text-green-500'
    if (stats.battery_level < 20) return 'text-red-500'
    if (stats.battery_level < 50) return 'text-yellow-500'
    return 'text-green-500'
  }

  const getTemperatureColor = () => {
    if (!stats.temperature) return 'text-gray-400'
    if (stats.temperature > 45) return 'text-red-500'
    if (stats.temperature > 35) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Smartphone className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-bold text-white">Mobile Mining</h2>
        <div className={`ml-auto px-2 py-1 rounded-full text-xs ${
          stats.mining_allowed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {stats.mining_allowed ? 'Ready' : 'Paused'}
        </div>
      </div>

      {error && (
        <div className="bg-red-600 text-white p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Battery Status */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Battery className={`h-4 w-4 ${getBatteryColor()}`} />
            <span className="text-white text-sm font-medium">Battery</span>
          </div>
          <div className="text-lg font-bold text-white">
            {stats.battery_level.toFixed(0)}%
          </div>
          <div className={`text-xs ${stats.is_charging ? 'text-green-400' : 'text-gray-400'}`}>
            {stats.is_charging ? 'Charging' : 'On Battery'}
          </div>
        </div>

        {/* Temperature */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Thermometer className={`h-4 w-4 ${getTemperatureColor()}`} />
            <span className="text-white text-sm font-medium">Temp</span>
          </div>
          <div className="text-lg font-bold text-white">
            {stats.temperature ? `${stats.temperature.toFixed(1)}°C` : 'N/A'}
          </div>
          <div className={`text-xs ${getTemperatureColor()}`}>
            {stats.temperature && stats.temperature > 40 ? 'Hot' : 'Normal'}
          </div>
        </div>

        {/* Mining Status */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className={`h-4 w-4 ${stats.solo_mining_active ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span className="text-white text-sm font-medium">Mining</span>
          </div>
          <div className={`text-lg font-bold ${stats.solo_mining_active ? 'text-green-400' : 'text-gray-400'}`}>
            {stats.solo_mining_active ? 'Active' : 'Stopped'}
          </div>
          <div className="text-xs text-gray-400">
            {performance.hashrate}
          </div>
        </div>

        {/* Background Service */}
        <div className="bg-gray-800 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            {stats.foreground_service_active ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-white text-sm font-medium">Service</span>
          </div>
          <div className={`text-lg font-bold ${stats.foreground_service_active ? 'text-green-400' : 'text-gray-400'}`}>
            {stats.foreground_service_active ? 'Running' : 'Stopped'}
          </div>
          <div className="text-xs text-gray-400">
            Background
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      {stats.solo_mining_active && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <h3 className="text-white font-medium">Performance</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Hashrate:</span>
              <span className="text-white ml-2">{performance.hashrate}</span>
            </div>
            <div>
              <span className="text-gray-400">Blocks Found:</span>
              <span className="text-white ml-2">{performance.blocks_found}</span>
            </div>
            <div>
              <span className="text-gray-400">Uptime:</span>
              <span className="text-white ml-2">{Math.floor(performance.uptime_minutes / 60)}h {performance.uptime_minutes % 60}m</span>
            </div>
            <div>
              <span className="text-gray-400">Est. Daily:</span>
              <span className="text-white ml-2">{performance.estimated_daily_earnings}</span>
            </div>
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="space-y-3">
        {/* Main Mining Toggle */}
        <button
          onClick={toggleMining}
          disabled={loading || !stats.mining_allowed}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
            stats.solo_mining_active
              ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
              : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
          } text-white disabled:cursor-not-allowed`}
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : stats.solo_mining_active ? (
            <>
              <Square className="h-5 w-5" />
              <span>Stop Mining</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Start Mining</span>
            </>
          )}
        </button>

        {/* Background Service Toggle */}
        <button
          onClick={toggleBackgroundService}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
            stats.foreground_service_active
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-blue-600 hover:bg-blue-700'
          } text-white`}
        >
          <Bell className="h-5 w-5" />
          <span>
            {stats.foreground_service_active ? 'Stop Background Service' : 'Start Background Service'}
          </span>
        </button>

        {/* Battery Optimization */}
        <button
          onClick={requestBatteryOptimization}
          disabled={loading}
          className="w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white text-sm"
        >
          <Shield className="h-4 w-4" />
          <span>Disable Battery Optimization</span>
        </button>
      </div>

      {/* Status Indicators */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-3">System Status</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Battery Protection:</span>
            <span className={stats.battery_level >= 20 ? 'text-green-400' : 'text-red-400'}>
              {stats.battery_level >= 20 ? 'Active' : 'Low Battery'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Thermal Protection:</span>
            <span className={!stats.temperature || stats.temperature <= 45 ? 'text-green-400' : 'text-red-400'}>
              {!stats.temperature || stats.temperature <= 45 ? 'Normal' : 'Overheating'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Background Service:</span>
            <span className={stats.foreground_service_active ? 'text-green-400' : 'text-gray-400'}>
              {stats.foreground_service_active ? 'Running' : 'Stopped'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Mining Permission:</span>
            <span className={stats.mining_allowed ? 'text-green-400' : 'text-red-400'}>
              {stats.mining_allowed ? 'Allowed' : 'Blocked'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Link */}
      <button 
        onClick={() => {/* Navigate to settings */}}
        className="w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white text-sm"
      >
        <Settings className="h-4 w-4" />
        <span>Mobile Settings</span>
      </button>
    </div>
  )
}