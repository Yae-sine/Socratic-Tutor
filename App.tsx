import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { LearningCompanion } from './pages/LearningCompanion';
import { Discussions } from './pages/Discussions';
import { LiveCoding } from './pages/LiveCoding';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState('companion');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      {/* Main Content Area */}
      <main className="flex-1 relative w-full h-full overflow-hidden">
        {activePage === 'companion' && <LearningCompanion />}
        {activePage === 'discussions' && <Discussions />}
        {activePage === 'coding' && <LiveCoding />}
      </main>
    </div>
  );
};

export default App;