/**
 * App.jsx — React Router Setup
 *
 * This file is ONLY responsible for routing.
 * No UI, no business logic — just route definitions.
 *
 * ROUTING STRUCTURE:
 * /login            → Login page (public)
 * /                 → Redirect to /dashboard
 * /dashboard/*      → DashboardLayout (protected) containing all app pages
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Clients from './pages/masters/Clients';
import Brokers from './pages/masters/Brokers';
import Vehicles from './pages/masters/Vehicles';
import Drivers from './pages/masters/Drivers';
import Shipments from './pages/shipments/Shipments';
import { ROUTES } from './constants/routes';

// ─── REACT QUERY CLIENT ───────────────────────────────────────────────────────
// Configure TanStack Query — our server state management layer.
// staleTime: 5 min means data stays "fresh" for 5 minutes (no refetch while fresh)
// retry: 1 means failed requests retry once before showing error
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false, // Don't refetch on tab switch
    },
  },
});

// ─── PLACEHOLDER COMPONENTS ───────────────────────────────────────────────────
// Minimal placeholders for routes not yet built.
// Phase by phase, each placeholder will be replaced with a full page.
const ComingSoon = ({ title }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
      style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' }}
    >
      <span className="text-2xl">🚧</span>
    </div>
    <h2 className="text-white font-bold text-xl mb-2">{title}</h2>
    <p className="text-slate-400 text-sm max-w-sm">
      This module is planned for an upcoming phase. Check the dashboard for build progress.
    </p>
  </div>
);

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>

            {/* ── PUBLIC ROUTES ────────────────────────────── */}
            <Route path={ROUTES.LOGIN} element={<Login />} />

            {/* ── ROOT REDIRECT ────────────────────────────── */}
            <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

            {/* ── PROTECTED ROUTES (use DashboardLayout) ───── */}
            <Route
              element={
                <PrivateRoute>
                  <DashboardLayout />
                </PrivateRoute>
              }
            >
              <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
              <Route path={ROUTES.CLIENTS} element={<Clients />} />
              <Route path={ROUTES.TRUCK_OWNERS} element={<Brokers />} />
              <Route path={ROUTES.DRIVERS} element={<Drivers />} />
              <Route path={ROUTES.VEHICLES} element={<Vehicles />} />
              <Route path={ROUTES.SHIPMENTS} element={<Shipments />} />
              <Route path={ROUTES.GPS_TRACKING} element={<ComingSoon title="Live GPS Tracking (Phase 8)" />} />
              <Route path={ROUTES.BILLING} element={<ComingSoon title="Billing & Invoices (Phase 7)" />} />
              <Route path={ROUTES.ANALYTICS} element={<ComingSoon title="Analytics & Reports (Phase 9)" />} />
              <Route path={ROUTES.REPORTS} element={<ComingSoon title="Reports (Phase 9)" />} />
              <Route path={ROUTES.AI_ASSISTANT} element={<ComingSoon title="AI Assistant (Phase 9)" />} />
              <Route path={ROUTES.NOTIFICATIONS} element={<ComingSoon title="Notifications (Phase 9)" />} />
              <Route path={ROUTES.USERS} element={<ComingSoon title="User Management" />} />
              <Route path={ROUTES.SETTINGS} element={<ComingSoon title="Settings" />} />
            </Route>

            {/* ── 404 FALLBACK ──────────────────────────────── */}
            <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
