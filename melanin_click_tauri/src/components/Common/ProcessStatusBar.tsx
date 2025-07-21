import React from 'react';

interface ProcessStatus {
  name: string;
  status: 'idle' | 'starting' | 'running' | 'stopping' | 'error';
  message?: string;
}

interface ProcessStatusBarProps {
  processStatuses: Record<string, ProcessStatus>;
}

const ProcessStatusBar: React.FC<ProcessStatusBarProps> = ({ processStatuses }) => {
  // Filter out processes that are idle to reduce clutter
  const activeProcesses = Object.entries(processStatuses).filter(([, status]) => 
    status.status !== 'idle'
  );

  // If no active processes, show a minimal status bar
  if (activeProcesses.length === 0) {
    return (
      <div className="bg-gray-800/30 backdrop-blur-sm border-t border-gray-700/50">
        <div className="container mx-auto px-6 py-2">
          <div className="flex items-center justify-center text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-gray-500" />
              <span className="text-gray-400">All systems idle</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6 text-sm">
            {activeProcesses.map(([key, status]) => (
              <div key={key} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  status.status === 'running' ? 'bg-green-500 animate-pulse' :
                  status.status === 'starting' ? 'bg-yellow-500 animate-pulse' :
                  status.status === 'stopping' ? 'bg-orange-500 animate-pulse' :
                  status.status === 'error' ? 'bg-red-500' :
                  'bg-gray-500'
                }`} />
                <div className="flex flex-col">
                  <span className="text-gray-200 font-medium">{status.name}</span>
                  <span className={`text-xs ${
                    status.status === 'running' ? 'text-green-400' :
                    status.status === 'starting' ? 'text-yellow-400' :
                    status.status === 'stopping' ? 'text-orange-400' :
                    status.status === 'error' ? 'text-red-400' :
                    'text-gray-500'
                  }`}>
                    {status.status === 'starting' ? 'Starting...' :
                     status.status === 'running' ? 'Running' :
                     status.status === 'stopping' ? 'Stopping...' :
                     status.status === 'error' ? (status.message || 'Error') :
                     'Idle'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {activeProcesses.length > 0 && (
            <div className="text-xs text-gray-400">
              {activeProcesses.length} active process{activeProcesses.length > 1 ? 'es' : ''}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessStatusBar; 