import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { Battery, Thermometer, Smartphone, Power, Settings } from 'lucide-react'

interface MobileSettings {
  battery_threshold: number
  temperature_threshold: number
  background_mining_enabled: boolean
  charging_only_mode: boolean
}

interface BatteryInfo {
  level: number
  is_charging: boolean
  temperature?: number
}

export default function MobileSettings() {
  const [settings, setSettings] = useState<MobileSettings>({
    battery_threshold: 20,
    temperature_threshold: 45,
    background_mining_enabled: true,
    charging_only_mode: false,
  })
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null)
  const [miningAllowed, setMiningAllowed] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
    loadBatteryStatus()
    
    // Set up periodic battery monitoring
    const interval = setInterval(loadBatteryStatus, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadSettings = async () => {
    try {
      const currentSettings = await invoke<MobileSettings>('get_mobile_settings')
      setSettings(currentSettings)
    } catch (error) {
      console.error('Failed to load mobile settings:', error)
    }
  }

  const loadBatteryStatus = async () => {
    try {
      const battery = await invoke<BatteryInfo | null>('get_battery_status')
      setBatteryInfo(battery)
      
      const allowed = await invoke<boolean>('is_mobile_mining_allowed')
      setMiningAllowed(allowed)
      
      setLoading(false)
    } catch (error) {
      console.error('Failed to load battery status:', error)
      setLoading(false)
    }
  }

  const updateSettings = async (newSettings: MobileSettings) => {
    try {
      await invoke('update_mobile_settings', { settings: newSettings })
      setSettings(newSettings)
      // Refresh mining permission after settings change
      setTimeout(loadBatteryStatus, 1000)
    } catch (error) {
      console.error('Failed to update mobile settings:', error)
    }
  }

  const handleBatteryThresholdChange = (value: number) => {
    updateSettings({ ...settings, battery_threshold: value })
  }

  const handleTemperatureThresholdChange = (value: number) => {
    updateSettings({ ...settings, temperature_threshold: value })
  }

  const handleBackgroundMiningToggle = () => {
    updateSettings({ ...settings, background_mining_enabled: !settings.background_mining_enabled })
  }

  const handleChargingOnlyToggle = () => {
    updateSettings({ ...settings, charging_only_mode: !settings.charging_only_mode })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 max-w-md mx-auto">
      <div className="flex items-center space-x-2 mb-6">
        <Smartphone className="h-6 w-6 text-blue-500" />
        <h2 className="text-xl font-bold text-white">Mobile Mining Settings</h2>
      </div>

      {/* Battery Status Card */}
      {batteryInfo && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Battery className={`h-5 w-5 ${batteryInfo.is_charging ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className="text-white font-medium">Battery Status</span>
            </div>
            <div className={`px-2 py-1 rounded text-sm ${miningAllowed ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
              {miningAllowed ? 'Mining OK' : 'Mining Paused'}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Level:</span>
              <span className="text-white ml-2">{batteryInfo.level.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-gray-400">Charging:</span>
              <span className="text-white ml-2">{batteryInfo.is_charging ? 'Yes' : 'No'}</span>
            </div>
            {batteryInfo.temperature && (
              <>
                <div>
                  <span className="text-gray-400">Temperature:</span>
                  <span className="text-white ml-2">{batteryInfo.temperature.toFixed(1)}°C</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Battery Threshold Setting */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Battery className="h-5 w-5 text-orange-500" />
          <span className="text-white font-medium">Battery Protection</span>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Stop mining when battery drops below: {settings.battery_threshold}%
          </label>
          <input
            type="range"
            min="10"
            max="50"
            value={settings.battery_threshold}
            onChange={(e) => handleBatteryThresholdChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>10%</span>
            <span>50%</span>
          </div>
        </div>
      </div>

      {/* Temperature Threshold Setting */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Thermometer className="h-5 w-5 text-red-500" />
          <span className="text-white font-medium">Thermal Protection</span>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-gray-400">
            Stop mining when temperature exceeds: {settings.temperature_threshold}°C
          </label>
          <input
            type="range"
            min="35"
            max="60"
            value={settings.temperature_threshold}
            onChange={(e) => handleTemperatureThresholdChange(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>35°C</span>
            <span>60°C</span>
          </div>
        </div>
      </div>

      {/* Background Mining Toggle */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Settings className="h-5 w-5 text-blue-500" />
            <div>
              <span className="text-white font-medium block">Background Mining</span>
              <span className="text-sm text-gray-400">Continue mining when app is minimized</span>
            </div>
          </div>
          <button
            onClick={handleBackgroundMiningToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.background_mining_enabled ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.background_mining_enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Charging Only Mode Toggle */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Power className="h-5 w-5 text-green-500" />
            <div>
              <span className="text-white font-medium block">Charging Only Mode</span>
              <span className="text-sm text-gray-400">Only mine when device is charging</span>
            </div>
          </div>
          <button
            onClick={handleChargingOnlyToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.charging_only_mode ? 'bg-green-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.charging_only_mode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mining Status Information */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">Mining Status</h3>
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-gray-400">Battery Check:</span>
            <span className={batteryInfo && batteryInfo.level >= settings.battery_threshold ? 'text-green-400' : 'text-red-400'}>
              {batteryInfo && batteryInfo.level >= settings.battery_threshold ? 'Pass' : 'Fail'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Charging Check:</span>
            <span className={!settings.charging_only_mode || (batteryInfo?.is_charging ?? false) ? 'text-green-400' : 'text-red-400'}>
              {!settings.charging_only_mode || (batteryInfo?.is_charging ?? false) ? 'Pass' : 'Fail'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Temperature Check:</span>
            <span className={!batteryInfo?.temperature || batteryInfo.temperature <= settings.temperature_threshold ? 'text-green-400' : 'text-red-400'}>
              {!batteryInfo?.temperature || batteryInfo.temperature <= settings.temperature_threshold ? 'Pass' : 'Fail'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}