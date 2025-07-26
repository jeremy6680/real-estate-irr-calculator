import { useState } from 'react';
import { ProjectDashboard } from './components/dashboard';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'calculator'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentView('calculator');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedProjectId(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Real Estate IRR Calculator</h1>
            {currentView === 'calculator' && (
              <button
                onClick={handleBackToDashboard}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Dashboard
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {currentView === 'dashboard' ? (
            <ProjectDashboard onSelectProject={handleSelectProject} />
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">IRR Calculator</h2>
              <p className="text-gray-600">
                Calculator component will be implemented in the next task.
                Selected project ID: {selectedProjectId}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
