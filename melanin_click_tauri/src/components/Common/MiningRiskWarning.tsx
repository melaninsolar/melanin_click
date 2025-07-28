import React, { useState } from 'react';
import { AlertTriangle, X, Check, Thermometer, DollarSign, Shield } from 'lucide-react';

interface MiningRiskWarningProps {
  onAccept: () => void;
  onDecline: () => void;
  miningType: 'bitcoin' | 'whive';
  isOpen: boolean;
}

const MiningRiskWarning: React.FC<MiningRiskWarningProps> = ({
  onAccept,
  onDecline,
  miningType,
  isOpen
}) => {
  const [hasReadAndAccepted, setHasReadAndAccepted] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">⚠️ Cryptocurrency Mining Risk Disclosure</h2>
              <p className="text-slate-400">Please read carefully before proceeding</p>
            </div>
          </div>
          <button
            onClick={onDecline}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Risk Categories */}
        <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Thermometer className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-red-400 mb-2">🔥 Hardware & Safety Risks</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• <strong>Overheating:</strong> CPU/GPU can reach dangerous temperatures</li>
                  <li>• <strong>Hardware damage:</strong> Excessive heat may permanently damage components</li>
                  <li>• <strong>Fire hazard:</strong> Poor ventilation or overloading can cause fires</li>
                  <li>• <strong>Electrical risks:</strong> Increased power consumption may overload circuits</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <DollarSign className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">💸 Financial Risks</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• <strong>Electricity costs:</strong> Mining consumes significant power</li>
                  <li>• <strong>Low profitability:</strong> CPU mining is often unprofitable</li>
                  <li>• <strong>Market volatility:</strong> Cryptocurrency values can crash</li>
                  <li>• <strong>Tax obligations:</strong> Mining income may be taxable</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-2">⚖️ Legal & Security Risks</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• <strong>Local regulations:</strong> Mining may be restricted in your area</li>
                  <li>• <strong>Environmental impact:</strong> High energy consumption concerns</li>
                  <li>• <strong>Pool risks:</strong> Mining pools may fail or become compromised</li>
                  <li>• <strong>Wallet security:</strong> You are responsible for securing your rewards</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Algorithm-specific warnings */}
        <div className="bg-slate-700/50 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-white mb-2">
            {miningType === 'bitcoin' ? '₿ Bitcoin (SHA-256) Specific Warnings' : '🔥 Whive (Yespower) Specific Warnings'}
          </h3>
          {miningType === 'bitcoin' ? (
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• <strong>Extremely low profitability:</strong> CPU mining Bitcoin is generally unprofitable</li>
              <li>• <strong>ASIC dominance:</strong> Professional miners have massive advantages</li>
              <li>• <strong>Educational only:</strong> Recommended for learning purposes only</li>
              <li>• <strong>Pool requirements:</strong> Solo mining with CPU is essentially impossible</li>
            </ul>
          ) : (
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• <strong>CPU intensive:</strong> Yespower algorithm heavily loads your processor</li>
              <li>• <strong>Thermal management:</strong> Ensure adequate cooling for sustained operation</li>
              <li>• <strong>Power consumption:</strong> Expect significant increase in electricity usage</li>
              <li>• <strong>Pool selection:</strong> Choose reputable pools to avoid payment issues</li>
            </ul>
          )}
        </div>

        {/* Safety Recommendations */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-green-400 mb-2">✅ Safety Recommendations</h3>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Monitor CPU/GPU temperatures constantly during mining</li>
            <li>• Ensure adequate ventilation and cooling in your mining area</li>
            <li>• Start with lower thread counts and gradually increase</li>
            <li>• Use reputable mining pools with good track records</li>
            <li>• Keep mining software and systems updated</li>
            <li>• Have emergency shutdown procedures ready</li>
          </ul>
        </div>

        {/* Legal Disclaimer */}
        <div className="bg-slate-900/50 rounded-xl p-4 mb-6 border border-slate-600">
          <h3 className="font-semibold text-slate-300 mb-2">📋 Legal Disclaimer</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            By proceeding, you acknowledge that cryptocurrency mining involves significant risks and that you are solely responsible for any damages, losses, or legal issues that may arise. This software is provided "as-is" without any warranties. The developers are not liable for any hardware damage, financial losses, legal issues, or other consequences resulting from mining activities. You must comply with all local laws and regulations regarding cryptocurrency mining and taxation.
          </p>
        </div>

        {/* Single Acceptance Checkbox */}
        <div className="mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <div className="relative flex-shrink-0 mt-1">
              <input
                type="checkbox"
                checked={hasReadAndAccepted}
                onChange={(e) => setHasReadAndAccepted(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                hasReadAndAccepted 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-slate-400 hover:border-green-400'
              }`}>
                {hasReadAndAccepted && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div>
              <p className="text-slate-300 text-sm font-medium">
                ✅ I have read and understand all the risks, warnings, and legal disclaimers above
              </p>
              <p className="text-slate-400 text-xs mt-1">
                I acknowledge that I am proceeding with cryptocurrency mining at my own risk and accept full responsibility for any consequences.
              </p>
            </div>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4">
          <button
            onClick={onDecline}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Cancel Mining
          </button>
          <button
            onClick={onAccept}
            disabled={!hasReadAndAccepted}
            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
          >
            Accept Risks & Start Mining
          </button>
        </div>
      </div>
    </div>
  );
};

export default MiningRiskWarning; 