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

// Import dark mode CSS
import '@/assets/styles/dark-mode.style.css';

const App: React.FC = () => {
  return (
    <Router>
      {/* Provider order is important - innermost providers can depend on outer providers */}
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
    </Router>
  );
};

export default App;