import React from 'react';
import { Settings, RotateCcw, AlertTriangle } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const handleResetApp = () => {
    console.log('Reset button clicked');
    
    if (window.confirm('Are you sure you want to reset the app? This will clear all preferences and restart the onboarding process.')) {
      try {
        console.log('User confirmed reset');
        
        // Show current localStorage contents
        console.log('Current localStorage contents:', { ...localStorage });
        
        // Clear localStorage
        localStorage.removeItem('melanin_click_preferences');
        console.log('Removed melanin_click_preferences from localStorage');
        
        // Clear all localStorage items that might be related to the app
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('melanin_click')) {
            localStorage.removeItem(key);
            console.log(`Removed ${key} from localStorage`);
          }
        });
        
        // Also clear sessionStorage
        sessionStorage.clear();
        console.log('Cleared sessionStorage');
        
        // Verify localStorage is cleared
        console.log('localStorage after clear:', { ...localStorage });
        
        // Show confirmation
        alert('App reset successfully! The page will now reload to restart onboarding.');
        
        // Force a hard reload to ensure all state is cleared
        setTimeout(() => {
          window.location.href = window.location.href;
        }, 100);
        
      } catch (error) {
        console.error('Error resetting app:', error);
        alert('Error resetting app. Please try refreshing the page manually.');
      }
    }
  };

  const handleSimpleReset = () => {
    console.log('Simple reset clicked');
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('All storage cleared');
      alert('All app data cleared! Please refresh the page (Ctrl+R or Cmd+R) to restart.');
    } catch (error) {
      console.error('Error with simple reset:', error);
      alert('Error clearing storage. Please try refreshing the page manually.');
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Settings className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Configure Melanin Click to suit your preferences and requirements
        </p>
      </div>

      <div className="space-y-6">
        {/* Reset Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Reset Application</h3>
              <p className="text-sm text-gray-400">Clear all preferences and restart onboarding</p>
            </div>
          </div>
          
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-500 mb-1">Warning</h4>
                <p className="text-sm text-red-300">
                  This will clear all your preferences, including:
                </p>
                <ul className="text-sm text-red-300 mt-2 space-y-1">
                  <li>• Installation preference (Bitcoin/Whive/Both)</li>
                  <li>• Onboarding completion status</li>
                  <li>• Terms of service acceptance</li>
                  <li>• All saved settings</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResetApp}
              className="w-full bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-500 py-3 px-4 rounded-lg transition-colors font-semibold"
            >
              Reset App & Restart Onboarding
            </button>
            
            <button
              onClick={handleSimpleReset}
              className="w-full bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-500 py-2 px-4 rounded-lg transition-colors font-medium text-sm"
            >
              Simple Reset (Clear All Data)
            </button>
          </div>
        </div>

        {/* Manual Reset Instructions */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Manual Reset Instructions</h3>
              <p className="text-sm text-gray-400">If the buttons above don't work, follow these steps</p>
            </div>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="bg-gray-700/30 rounded-lg p-3">
              <p className="text-white font-medium mb-1">Method 1: DevTools</p>
              <ol className="text-gray-300 space-y-1">
                <li>1. Press <kbd className="bg-gray-600 px-2 py-1 rounded text-xs">F12</kbd> to open DevTools</li>
                <li>2. Go to <strong>Application</strong> tab</li>
                <li>3. Find <strong>Local Storage</strong> in the left sidebar</li>
                <li>4. Delete <code className="bg-gray-600 px-1 rounded">melanin_click_preferences</code></li>
                <li>5. Refresh the page (<kbd className="bg-gray-600 px-2 py-1 rounded text-xs">Ctrl+R</kbd> or <kbd className="bg-gray-600 px-2 py-1 rounded text-xs">Cmd+R</kbd>)</li>
              </ol>
            </div>
            
            <div className="bg-gray-700/30 rounded-lg p-3">
              <p className="text-white font-medium mb-1">Method 2: Browser Console</p>
              <ol className="text-gray-300 space-y-1">
                <li>1. Press <kbd className="bg-gray-600 px-2 py-1 rounded text-xs">F12</kbd> and go to <strong>Console</strong> tab</li>
                <li>2. Type: <code className="bg-gray-600 px-1 rounded">localStorage.clear()</code></li>
                <li>3. Press <kbd className="bg-gray-600 px-2 py-1 rounded text-xs">Enter</kbd></li>
                <li>4. Refresh the page</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Future Settings */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 border border-gray-700 text-center">
          <Settings className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h4 className="font-semibold text-white mb-2">Additional Settings</h4>
          <p className="text-sm text-gray-400">Advanced configuration options coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
