import { useState } from 'react';
import { Card, Button } from '@components/common';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Real Estate IRR Calculator</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Card title="Welcome">
            <p className="mb-4">
              This application helps real estate investors calculate the Internal Rate of Return (IRR)
              for property investments.
            </p>
            <Button>Get Started</Button>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default App;
