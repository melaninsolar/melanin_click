import React, { useState } from 'react';
import { Bitcoin, Cpu, Check, ChevronLeft, ChevronRight, Settings, HardDrive, Zap, Clock, DollarSign } from 'lucide-react';
import { InstallationPreference } from '../../types';

interface SelectionPageProps {
  onSelection: (preference: InstallationPreference) => void;
  onBack: () => void;
}

const SelectionPage: React.FC<SelectionPageProps> = ({ onSelection, onBack }) => {
  const [selectedPreference, setSelectedPreference] = useState<InstallationPreference>('both');

  const handleContinue = () => {
    onSelection(selectedPreference);
  };

  const options = [
    {
      id: 'bitcoin' as InstallationPreference,
      title: 'Bitcoin Only',
      subtitle: 'Focus on Bitcoin Core operations',
      icon: Bitcoin,
      iconColor: 'text-bitcoin',
      bgColor: 'bg-bitcoin/20',
      borderColor: 'border-bitcoin',
      features: [
        'Bitcoin Core node management',
        'Wallet operations',
        'Network monitoring',
        'Blockchain synchronization',
        'Transaction history'
      ],
      requirements: [
        'Disk Space: ~500GB+ (full node)',
        'Network: High bandwidth recommended',
        'Memory: 4GB+ RAM',
        'Initial sync: 6-24 hours'
      ],
      description: 'Perfect for Bitcoin-focused operations. Run a full Bitcoin node, manage wallets, and monitor the Bitcoin network.'
    },
    {
      id: 'whive' as InstallationPreference,
      title: 'Whive Only',
      subtitle: 'Specialized for Whive Protocol',
      icon: Cpu,
      iconColor: 'text-whive',
      bgColor: 'bg-whive/20',
      borderColor: 'border-whive',
      features: [
        'Whive node operations',
        'YescryptR32 CPU mining',
        'Low power consumption',
        'Optimized for CPU mining',
        'Sustainable mining approach'
      ],
      requirements: [
        'Disk Space: ~50GB+',
        'Network: Moderate bandwidth',
        'Memory: 2GB+ RAM',
        'Initial sync: 2-6 hours'
      ],
      description: 'Ideal for efficient CPU mining with Whive Protocol. Environmentally friendly and accessible to all users.'
    },
    {
      id: 'both' as InstallationPreference,
      title: 'Bitcoin + Whive',
      subtitle: 'Complete cryptocurrency suite',
      icon: Settings,
      iconColor: 'text-primary-500',
      bgColor: 'bg-primary-500/20',
      borderColor: 'border-primary-500',
      features: [
        'Full Bitcoin Core functionality',
        'Complete Whive operations',
        'Dual mining capabilities',
        'Portfolio diversification',
        'Comprehensive monitoring'
      ],
      requirements: [
        'Disk Space: ~550GB+',
        'Network: High bandwidth',
        'Memory: 6GB+ RAM',
        'Initial sync: 8-30 hours'
      ],
      description: 'The complete experience with both Bitcoin and Whive protocols. Maximum flexibility and features.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Setup</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Select which cryptocurrency protocols you want to install and manage. You can change this later in settings.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedPreference === option.id;
            
            return (
              <div
                key={option.id}
                onClick={() => setSelectedPreference(option.id)}
                className={`
                  relative cursor-pointer rounded-xl p-6 transition-all duration-200 hover:scale-105
                  ${isSelected 
                    ? `bg-gray-800/80 border-2 ${option.borderColor} shadow-lg shadow-${option.iconColor}/20` 
                    : 'bg-gray-800/50 border border-gray-700 hover:border-gray-600'
                  }
                `}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Header */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 ${option.bgColor} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${option.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{option.title}</h3>
                    <p className="text-sm text-gray-400">{option.subtitle}</p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-4">{option.description}</p>

                {/* Features */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-1" />
                    Features
                  </h4>
                  <ul className="space-y-1">
                    {option.features.map((feature, index) => (
                      <li key={index} className="flex items-start text-xs text-gray-400">
                        <Check className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                    <HardDrive className="w-4 h-4 mr-1" />
                    Requirements
                  </h4>
                  <ul className="space-y-1">
                    {option.requirements.map((req, index) => (
                      <li key={index} className="flex items-start text-xs text-gray-400">
                        <Clock className="w-3 h-3 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700 mb-8">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white mb-2">Important Notes</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• All cryptocurrency operations involve financial risk</li>
                <li>• Initial blockchain synchronization requires time and bandwidth</li>
                <li>• Mining profitability depends on hardware, electricity costs, and market conditions</li>
                <li>• You can modify your selection later in the application settings</li>
                <li>• Both protocols can be installed on the same system without conflicts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <button
              onClick={handleContinue}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <span>Continue with {options.find(opt => opt.id === selectedPreference)?.title}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <p className="text-gray-500 text-xs mt-2">
              This will configure your installation preferences
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectionPage; 