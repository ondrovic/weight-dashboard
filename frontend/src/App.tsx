// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { MetricsProvider } from './contexts/MetricsContext';
import { DarkModeProvider } from './contexts/DarkModeProvider';
import { SidebarProvider } from './contexts/SidebarContext';
import WeightDashboardPage from './pages/WeightDashboardPage';
import DataEntryPage from './pages/DataEntryPage';
import SettingsPage from './pages/SettingsPage';

// Import dark mode CSS
import './assets/styles/darkMode.css';

const App: React.FC = () => {
  return (
    <Router>
      {/* Provider order is important - innermost providers can depend on outer providers */}
      <MetricsProvider>
        <DarkModeProvider>
          <SidebarProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<WeightDashboardPage />} />
                <Route path="/data" element={<DataEntryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </Layout>
          </SidebarProvider>
        </DarkModeProvider>
      </MetricsProvider>
    </Router>
  );
};

export default App;