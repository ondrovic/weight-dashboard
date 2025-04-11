// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/Layout';
import { MetricsProvider } from './contexts/Metrics';
import { DarkModeProvider } from './contexts/DarkMode';
import { SidebarProvider } from './contexts/Sidebar';
import { ConfirmationProvider } from './contexts/Confrimation';
import { WeightDashboardPage } from './pages/Dashboard';
import { DataEntryPage } from './pages/DataEntry';
import { SettingsPage } from './pages/Settings';
import { ToastNotification } from '@/components/toast-notification/toast-notification';
// Import dark mode CSS
import '@/assets/styles/dark-mode.style.css';

const App: React.FC = () => {
  return (
    <Router>
      <ToastNotification>
        <MetricsProvider>
          <DarkModeProvider>
            <SidebarProvider>
              <ConfirmationProvider>
                <Layout>
                  <Routes>
                    <Route path="/" element={<WeightDashboardPage />} />
                    <Route path="/data" element={<DataEntryPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Layout>
              </ConfirmationProvider>
            </SidebarProvider>
          </DarkModeProvider>
        </MetricsProvider>
      </ToastNotification>
    </Router>
  );
};

export default App;