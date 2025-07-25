import React from 'react';
import { Bitcoin, Monitor, Cpu, Zap, Settings, ChevronDown } from 'lucide-react';
import { PageType, UserPreferences } from '../../types';

interface HeaderProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  availablePages: PageType[];
  userPreferences: UserPreferences;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange, availablePages, userPreferences }) => {
  const allPages = [
    { 
      id: 'home', 
      label: 'Dashboard', 
      icon: Monitor,
      description: 'System overview and quick actions'
    },
    { 
      id: 'bitcoin', 
      label: 'Bitcoin', 
      icon: Bitcoin,
      description: 'Bitcoin node and mining operations'
    },
    { 
      id: 'whive', 
      label: 'Whive', 
      icon: Cpu,
      description: 'Whive node and CPU mining'
    },
    { 
      id: 'mining', 
      label: 'Mining', 
      icon: Zap,
      description: 'Advanced mining controls'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      description: 'Application preferences'
    }
  ];

  // Filter pages based on user preferences
  const visiblePages = allPages.filter(page => availablePages.includes(page.id as PageType));

  const getConfigurationLabel = () => {
    if (!userPreferences.hasCompletedOnboarding) return 'Setup Required';
    
    switch (userPreferences.installationPreference) {
      case 'both':
        return 'Bitcoin + Whive';
      case 'bitcoin':
        return 'Bitcoin Only';
      case 'whive':
        return 'Whive Only';
      default:
        return 'Custom Setup';
    }
  };

  const getConfigurationColor = () => {
    if (!userPreferences.hasCompletedOnboarding) return 'text-orange-400';
    
    switch (userPreferences.installationPreference) {
      case 'both':
        return 'text-green-400';
      case 'bitcoin':
        return 'text-orange-400';
      case 'whive':
        return 'text-purple-400';
      default:
        return 'text-blue-400';
    }
  };

  return (
    <header className="glass-strong border-b border-slate-600/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center p-1 shadow-lg group-hover:shadow-primary-500/25 transition-all duration-300">
                <img 
                  src="/myicon.png" 
                  alt="Melanin Click" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 -z-10"></div>
            </div>
            
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-200">Melanin Click</h1>
              <div className="flex items-center space-x-3 text-sm">
                <span className="text-slate-400">v2.0.0</span>
                <div className="w-1 h-1 bg-slate-500 rounded-full"></div>
                <span className={`font-medium ${getConfigurationColor()}`}>
                  {getConfigurationLabel()}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex items-center">
            <div className="hidden md:flex items-center space-x-1">
              {visiblePages.map(({ id, label, icon: Icon, description }) => (
                <button
                  key={id}
                  onClick={() => onPageChange(id as PageType)}
                  className={`group relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === id 
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                  title={description}
                >
                  <Icon className={`w-4 h-4 transition-all duration-200 ${
                    currentPage === id ? '' : 'group-hover:scale-110'
                  }`} />
                  <span className="hidden lg:inline">{label}</span>
                  
                  {/* Active indicator */}
                  {currentPage === id && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Navigation Menu */}
            <div className="md:hidden relative">
              <button className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all duration-200">
                {(() => {
                  const currentPageData = visiblePages.find(page => page.id === currentPage);
                  return currentPageData?.icon ? <currentPageData.icon className="w-4 h-4" /> : null;
                })()}
                <span className="text-sm font-medium">
                  {visiblePages.find(page => page.id === currentPage)?.label || 'Menu'}
                </span>
                <ChevronDown className="w-3 h-3" />
              </button>
              
              {/* Mobile dropdown would go here - implement if needed */}
            </div>
          </nav>
        </div>
      </div>

      {/* Optional: Page breadcrumb/subtitle */}
      <div className="border-t border-slate-700/30 bg-slate-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <p className="text-xs text-slate-400 hidden sm:block">
            {visiblePages.find(page => page.id === currentPage)?.description || 'Navigate through your cryptocurrency operations'}
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header; 