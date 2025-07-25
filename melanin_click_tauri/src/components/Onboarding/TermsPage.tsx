import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronLeft, ChevronRight, FileText, AlertTriangle } from 'lucide-react';

interface TermsPageProps {
  onAccept: () => void;
  onBack: () => void;
}

const TermsPage: React.FC<TermsPageProps> = ({ onAccept, onBack }) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight < 10;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAccept = () => {
    if (hasAccepted && hasScrolledToBottom) {
      onAccept();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Terms and Conditions</h1>
          <p className="text-gray-400">Please read and accept our terms to continue</p>
        </div>

        {/* Terms Content */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700 overflow-hidden">
          {/* Scroll Area */}
          <div 
            className="h-96 overflow-y-auto p-6 text-gray-300 text-sm leading-relaxed"
            onScroll={handleScroll}
          >
            <h2 className="text-lg font-semibold text-white mb-4">End User License Agreement (EULA)</h2>
            <p className="mb-4">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>

            <h3 className="text-base font-semibold text-white mb-3">1. Acceptance of Terms</h3>
            <p className="mb-4">
              By installing, accessing, or using Melanin Click ("the Software"), you agree to be bound by these Terms and Conditions ("Terms"). 
              If you do not agree to these Terms, do not install or use the Software.
            </p>

            <h3 className="text-base font-semibold text-white mb-3">2. Description of Software</h3>
            <p className="mb-4">
              Melanin Click is a desktop application designed to facilitate Bitcoin and Whive cryptocurrency operations, including but not limited to:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Running Bitcoin and Whive nodes</li>
              <li>Cryptocurrency mining operations</li>
              <li>Blockchain monitoring and management</li>
              <li>Wallet management interfaces</li>
            </ul>

            <h3 className="text-base font-semibold text-white mb-3">3. License Grant</h3>
            <p className="mb-4">
              Subject to your compliance with these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Software 
              for your personal or commercial purposes in accordance with these Terms.
            </p>

            <h3 className="text-base font-semibold text-white mb-3">4. Cryptocurrency Risks</h3>
            <p className="mb-2">
              <strong className="text-yellow-400">WARNING:</strong> Cryptocurrency operations involve significant risks:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Market volatility may result in financial losses</li>
              <li>Mining operations consume electricity and may not be profitable</li>
              <li>Blockchain transactions are typically irreversible</li>
              <li>You are responsible for securing your private keys and wallet data</li>
              <li>Regulatory changes may affect cryptocurrency operations</li>
            </ul>

            <h3 className="text-base font-semibold text-white mb-3">5. User Responsibilities</h3>
            <p className="mb-2">You agree to:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Use the Software in compliance with all applicable laws and regulations</li>
              <li>Maintain the security of your devices and accounts</li>
              <li>Back up your wallet data and private keys</li>
              <li>Monitor your mining operations and energy consumption</li>
              <li>Not use the Software for illegal activities</li>
            </ul>

            <h3 className="text-base font-semibold text-white mb-3">6. Prohibited Uses</h3>
            <p className="mb-2">You may not:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Reverse engineer, decompile, or disassemble the Software</li>
              <li>Use the Software to violate any laws or regulations</li>
              <li>Attempt to gain unauthorized access to any systems or networks</li>
              <li>Use the Software to harm or defraud others</li>
              <li>Distribute malware or engage in malicious activities</li>
            </ul>

            <h3 className="text-base font-semibold text-white mb-3">7. Disclaimer of Warranties</h3>
            <p className="mb-4">
              THE SOFTWARE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, 
              INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>

            <h3 className="text-base font-semibold text-white mb-3">8. Limitation of Liability</h3>
            <p className="mb-4">
              IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, 
              INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>

            <h3 className="text-base font-semibold text-white mb-3">9. Privacy and Data</h3>
            <p className="mb-4">
              The Software may collect system information for optimal performance. We do not collect private keys, wallet data, 
              or personal financial information. All blockchain operations are performed locally on your device.
            </p>

            <h3 className="text-base font-semibold text-white mb-3">10. Updates and Modifications</h3>
            <p className="mb-4">
              We may update the Software and these Terms from time to time. Continued use of the Software after updates 
              constitutes acceptance of any changes.
            </p>

            <h3 className="text-base font-semibold text-white mb-3">11. Termination</h3>
            <p className="mb-4">
              This license is effective until terminated. You may terminate it at any time by uninstalling the Software. 
              We may terminate this license if you violate these Terms.
            </p>

            <h3 className="text-base font-semibold text-white mb-3">12. Contact Information</h3>
            <p className="mb-4">
              For questions about these Terms, please contact the Melanin Click development team through our official channels.
            </p>

            <div className="text-center mt-8 p-4 bg-gray-700/30 rounded-lg">
              <p className="text-gray-400 text-xs">
                By continuing, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
              </p>
            </div>
          </div>

          {/* Scroll Indicator */}
          {!hasScrolledToBottom && (
            <div className="bg-yellow-500/20 border-t border-yellow-500/30 p-3">
              <div className="flex items-center space-x-2 text-yellow-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm">Please scroll down to read the complete terms</span>
              </div>
            </div>
          )}

          {/* Agreement Section */}
          <div className="border-t border-gray-700 p-6">
            <label className="flex items-start space-x-3 cursor-pointer">
              <div className="flex-shrink-0 mt-1">
                {hasAccepted ? (
                  <CheckCircle 
                    className="w-5 h-5 text-primary-500"
                    onClick={() => setHasAccepted(!hasAccepted)}
                  />
                ) : (
                  <Circle 
                    className="w-5 h-5 text-gray-400 hover:text-primary-500 transition-colors"
                    onClick={() => setHasAccepted(!hasAccepted)}
                  />
                )}
              </div>
              <div className="text-sm">
                <p className="text-white font-medium">
                  I have read and agree to the Terms and Conditions
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  You must accept these terms to use Melanin Click
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={onBack}
            className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleAccept}
            disabled={!hasAccepted || !hasScrolledToBottom}
            className={`inline-flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
              hasAccepted && hasScrolledToBottom
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsPage; 