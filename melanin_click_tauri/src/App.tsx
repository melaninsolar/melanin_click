import React, { useState, useEffect } from 'react';
import Header from './components/Layout/Header';
import HomePage from './pages/HomePage';
import BitcoinPage from './pages/BitcoinPage';
import WhivePage from './pages/WhivePage';
import MiningPage from './pages/MiningPage';
import SettingsPage from './pages/SettingsPage';
import NotificationCenter from './components/Common/NotificationCenter';
import ProcessStatusBar from './components/Common/ProcessStatusBar';
import WelcomePage from './components/Onboarding/WelcomePage';
import TermsPage from './components/Onboarding/TermsPage';
import SelectionPage from './components/Onboarding/SelectionPage';
import { useNotifications } from './hooks/useNotifications';
import { useSystemInfo } from './hooks/useSystemInfo';
import { PageType, OnboardingStep, UserPreferences, InstallationPreference, ProcessStatus } from './types';
import "./App.css";

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('welcome');
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    hasCompletedOnboarding: false,
    hasAcceptedTerms: false,
    installationPreference: 'both'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processes] = useState<Record<string, number>>({});
  const [processStatuses, setProcessStatuses] = useState<Record<string, ProcessStatus>>({
    bitcoin_download: { name: 'Bitcoin Download', status: 'idle' },
    whive_download: { name: 'Whive Download', status: 'idle' },
    bitcoin_node: { name: 'Bitcoin Node', status: 'idle' },
    whive_node: { name: 'Whive Node', status: 'idle' },
    bitcoin_mining: { name: 'Bitcoin Mining', status: 'idle' },
    whive_mining: { name: 'Whive Mining', status: 'idle' },
  });

  const { notifications, addNotification, removeNotification } = useNotifications();
  const { systemInfo, cryptoConfig } = useSystemInfo();

  // Helper function to update process status
  const updateProcessStatus = (processKey: string, status: ProcessStatus['status'], message?: string) => {
    setProcessStatuses(prev => ({
      ...prev,
      [processKey]: {
        ...prev[processKey],
        status,
        message
      }
    }));
  };

  // Load user preferences from localStorage on mount
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const savedPreferences = localStorage.getItem('melanin_click_preferences');
        if (savedPreferences) {
          const parsed = JSON.parse(savedPreferences);
          setUserPreferences(parsed);
          
          // If user has completed onboarding, skip to main app
          if (parsed.hasCompletedOnboarding) {
            setOnboardingStep('complete');
          }
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
        addNotification('error', 'Settings Error', 'Failed to load user preferences');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [addNotification]);

  // Save user preferences to localStorage
  const savePreferences = (preferences: UserPreferences) => {
    try {
      localStorage.setItem('melanin_click_preferences', JSON.stringify(preferences));
      setUserPreferences(preferences);
    } catch (error) {
      console.error('Error saving preferences:', error);
      addNotification('error', 'Settings Error', 'Failed to save user preferences');
    }
  };

  // Handle onboarding navigation
  const handleWelcomeContinue = () => {
    setOnboardingStep('terms');
  };

  const handleTermsAccept = () => {
    const updatedPreferences = {
      ...userPreferences,
      hasAcceptedTerms: true,
      agreedToTermsDate: new Date().toISOString()
    };
    savePreferences(updatedPreferences);
    setOnboardingStep('selection');
  };

  const handleTermsBack = () => {
    setOnboardingStep('welcome');
  };

  const handleSelectionComplete = (preference: InstallationPreference) => {
    const updatedPreferences = {
      ...userPreferences,
      installationPreference: preference,
      hasCompletedOnboarding: true
    };
    savePreferences(updatedPreferences);
    setOnboardingStep('complete');
    
    // Show success notification
    addNotification(
      'success', 
      'Setup Complete!', 
      `Successfully configured for ${preference === 'both' ? 'Bitcoin + Whive' : preference === 'bitcoin' ? 'Bitcoin Only' : 'Whive Only'}`
    );
  };

  const handleSelectionBack = () => {
    setOnboardingStep('terms');
  };

  // Get available pages based on user preferences
  const getAvailablePages = (): PageType[] => {
    if (!userPreferences.hasCompletedOnboarding) {
      return ['home'];
    }

    const basePages: PageType[] = ['home', 'settings'];
    const { installationPreference } = userPreferences;

    switch (installationPreference) {
      case 'bitcoin':
        return [...basePages, 'bitcoin'];
      case 'whive':
        return [...basePages, 'whive', 'mining'];
      case 'both':
        return [...basePages, 'bitcoin', 'whive', 'mining'];
      default:
        return basePages;
    }
  };

  // Initialize application
  useEffect(() => {
    const initializeApp = async () => {
      if (userPreferences.hasCompletedOnboarding) {
        try {
          // Add initialization logic here if needed
          addNotification('info', 'Welcome Back!', 'Melanin Click is ready to use');
        } catch (error) {
          console.error('Error initializing app:', error);
          addNotification('error', 'Initialization Error', 'Failed to initialize application');
        }
      }
    };

    if (onboardingStep === 'complete') {
      initializeApp();
    }
  }, [onboardingStep, userPreferences.hasCompletedOnboarding, addNotification]);

  // Show loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-primary-400 rounded-full animate-spin-slow"></div>
          </div>
          <div className="space-y-2">
            <p className="text-white text-xl font-semibold">Loading Melanin Click</p>
            <p className="text-slate-400">Initializing your mining interface...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show onboarding flow
  if (onboardingStep !== 'complete') {
    switch (onboardingStep) {
      case 'welcome':
        return <WelcomePage onContinue={handleWelcomeContinue} />;
      case 'terms':
        return <TermsPage onAccept={handleTermsAccept} onBack={handleTermsBack} />;
      case 'selection':
        return <SelectionPage onSelection={handleSelectionComplete} onBack={handleSelectionBack} />;
      default:
        return <WelcomePage onContinue={handleWelcomeContinue} />;
    }
  }

  // Render current page
  const renderCurrentPage = () => {
    const availablePages = getAvailablePages();
    
    // If current page is not available, switch to home
    if (!availablePages.includes(currentPage)) {
      setCurrentPage('home');
      return (
        <HomePage
          systemInfo={systemInfo}
          cryptoConfig={cryptoConfig}
          processStatuses={processStatuses}
          processes={processes}
          onAddNotification={addNotification}
          onUpdateProcessStatus={updateProcessStatus}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            systemInfo={systemInfo}
            cryptoConfig={cryptoConfig}
            processStatuses={processStatuses}
            processes={processes}
            onAddNotification={addNotification}
            onUpdateProcessStatus={updateProcessStatus}
          />
        );
      case 'bitcoin':
        return <BitcoinPage />;
      case 'whive':
        return <WhivePage />;
      case 'mining':
        return <MiningPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return (
          <HomePage
            systemInfo={systemInfo}
            cryptoConfig={cryptoConfig}
            processStatuses={processStatuses}
            processes={processes}
            onAddNotification={addNotification}
            onUpdateProcessStatus={updateProcessStatus}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <Header 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
        availablePages={getAvailablePages()}
        userPreferences={userPreferences}
      />
      
      <main className="flex-1 flex flex-col">
        {/* Main content wrapper with consistent padding and max-width */}
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-full">
            {renderCurrentPage()}
          </div>
        </div>
      </main>

      <ProcessStatusBar processStatuses={processStatuses} />
      <NotificationCenter 
        notifications={notifications}
        onRemoveNotification={removeNotification}
      />
    </div>
  );
};

export default App;
