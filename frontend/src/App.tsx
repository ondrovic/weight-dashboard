// frontend/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/common/layout.component';
import { MetricsProvider } from './contexts/metrics.context';
import { DarkModeProvider } from './contexts/dark-mode-provider.context';
import { SidebarProvider } from './contexts/sidebar.context';
import { ConfirmationProvider } from './contexts/confirmation.context';
import { WeightDashboardPage } from './pages/weight-dashboard.page';
import { DataEntryPage } from './pages/data-entry.page';
import { SettingsPage } from './pages/settings.page';
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