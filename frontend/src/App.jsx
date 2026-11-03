import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { RightPanel } from './components/common/RightPanel';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { ClaimsPage } from './pages/ClaimsPage';
import { ClaimDetailPage } from './pages/ClaimDetailPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { EvaluationsPage } from './pages/EvaluationsPage';
import { UsersPage } from './pages/UsersPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Standard layout with Left Sidebar, Center Canvas & Right Activity Panel + Animated Page Transitions
function AppLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global ⌘K or Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070A0F] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#ccff00] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-slate-100 font-sans selection:bg-[#ccff00] selection:text-black">
      {/* 1. Left Navigation Sidebar with Search Trigger */}
      <Sidebar onOpenSearch={() => setSearchOpen(true)} />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onOpenSearch={() => setSearchOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">
          <div className="max-w-6xl mx-auto">
            <ErrorBoundary>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 12, filter: 'blur(3px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* 3. Right Activity & Notifications Sidebar */}
      <RightPanel />

      {/* 4. Global Spotlight Command / Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Application Routes */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/workspace/:id" element={<WorkspacePage />} />
              <Route path="/claims" element={<ClaimsPage />} />
              <Route path="/claims/:id" element={<ClaimDetailPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="/policies" element={<PoliciesPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
              <Route path="/evaluations" element={<EvaluationsPage />} />
              <Route path="/admin/users" element={<UsersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
