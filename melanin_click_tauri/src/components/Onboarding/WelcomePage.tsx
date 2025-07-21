import React from 'react';
import { Bitcoin, Cpu, ChevronRight, Monitor, Shield, Zap } from 'lucide-react';

interface WelcomePageProps {
  onContinue: () => void;
}

const WelcomePage: React.FC<WelcomePageProps> = ({ onContinue }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          {/* Logo */}
          <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 p-2">
            <img 
              src="/myicon.png" 
              alt="Melanin Click" 
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Title */}
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Melanin Click</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Your professional desktop client for Bitcoin and Whive cryptocurrency operations. 
            Manage nodes, mine efficiently, and monitor your blockchain activities with ease.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 bg-bitcoin/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Bitcoin className="w-6 h-6 text-bitcoin" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Bitcoin Core</h3>
            <p className="text-gray-400 text-sm">
              Run full Bitcoin nodes, manage wallets, and participate in the Bitcoin network with enterprise-grade tools.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 bg-whive/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Cpu className="w-6 h-6 text-whive" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Whive Protocol</h3>
            <p className="text-gray-400 text-sm">
              CPU-optimized mining with YescryptR32 algorithm. Efficient, sustainable cryptocurrency mining for everyone.
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Advanced Mining</h3>
            <p className="text-gray-400 text-sm">
              Professional mining operations with pool selection, hardware optimization, and real-time monitoring.
            </p>
          </div>
        </div>

        {/* Key Benefits */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-8 border border-gray-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Choose Melanin Click?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Secure & Open Source</h3>
                <p className="text-gray-400 text-sm">Built with Rust and React for maximum security and performance.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Monitor className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Cross-Platform</h3>
                <p className="text-gray-400 text-sm">Native desktop app for macOS, Linux, and Windows.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Zap className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">High Performance</h3>
                <p className="text-gray-400 text-sm">Optimized for speed and efficiency with minimal resource usage.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Cpu className="w-5 h-5 text-primary-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-white mb-1">Easy to Use</h3>
                <p className="text-gray-400 text-sm">Intuitive interface designed for both beginners and experts.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={onContinue}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105"
          >
            <span>Get Started</span>
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-gray-500 text-sm mt-3">
            Click to begin the setup process
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage; 