import React from 'react';
import { Bitcoin, Monitor, Cpu, Zap, Settings } from 'lucide-react';
import { PageType, UserPreferences } from '../../types';

interface HeaderProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  availablePages: PageType[];
  userPreferences: UserPreferences;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange, availablePages, userPreferences }) => {
  const allPages = [
    { id: 'home', label: 'Dashboard', icon: Monitor },
    { id: 'bitcoin', label: 'Bitcoin', icon: Bitcoin },
    { id: 'whive', label: 'Whive', icon: Cpu },
    { id: 'mining', label: 'Mining', icon: Zap },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Filter pages based on user preferences
  const visiblePages = allPages.filter(page => availablePages.includes(page.id as PageType));

  return (
    <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center p-1">
              <img 
                src="/myicon.png" 
                alt="Melanin Click" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold">Melanin Click</h1>
              <p className="text-sm text-gray-400">
                Bitcoin & Whive Desktop Client v2.0.0
                {userPreferences.hasCompletedOnboarding && (
                  <span className="ml-2 text-primary-400">
                    ({userPreferences.installationPreference === 'both' ? 'Bitcoin + Whive' : 
                      userPreferences.installationPreference === 'bitcoin' ? 'Bitcoin Only' : 'Whive Only'})
                  </span>
                )}
              </p>
            </div>
          </div>
          <nav className="flex space-x-1">
            {visiblePages.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => onPageChange(id as PageType)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === id 
                    ? 'bg-primary-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 