// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { NewLayout } from './components/common/NewLayout';
import { MetricsProvider } from './contexts/MetricsContext';
import { DarkModeProvider } from './contexts/DarkModeProvider';
import WeightDashboardPage from './pages/WeightDashboardPage';
import DataEntryPage from './pages/DataEntryPage';
import SettingsPage from './pages/SettingsPage';

// Import dark mode CSS
import './assets/styles/darkMode.css';

const App: React.FC = () => {
  return (
    <Router>
      <DarkModeProvider>
        <MetricsProvider>
          <NewLayout>
            <Routes>
              <Route path="/" element={<WeightDashboardPage />} />
              <Route path="/data" element={<DataEntryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </NewLayout>
        </MetricsProvider>
      </DarkModeProvider>
    </Router>
  );
};

export default App;