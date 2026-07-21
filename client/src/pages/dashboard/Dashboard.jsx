/**
 * pages/dashboard/Dashboard.jsx
 *
 * LogiTrack AI Command Center
 * Combines all dashboard widgets and handles loading / error / empty states
 * using React Query for server state.
 */

import { motion } from 'framer-motion';
import { RefreshCw, AlertCircle } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

// React Query Hooks
import {
    useKPIs,
    useRevenueChart,
    useMonthlyRevenue,
    useStatusBreakdown,
    useRecentShipments,
    useTopClients,
    useActivityFeed,
    useDelayedShipments,
} from '../../hooks/useDashboard';

// Dashboard Components
import KpiCards from './components/KpiCards';
import RevenueChart from './components/RevenueChart';
import MonthlyRevenueChart from './components/MonthlyRevenueChart';
import ShipmentStatusChart from './components/ShipmentStatusChart';
import RecentShipmentsTable from './components/RecentShipmentsTable';
import TopClientsCard from './components/TopClientsCard';
import QuickActions from './components/QuickActions';
import ActivityFeed from './components/ActivityFeed';
import DelayedShipmentsAlert from './components/DelayedShipmentsAlert';

// Reusable Skeleton Loader
const Skeleton = ({ className }) => (
    <div
        className={`animate-pulse rounded-2xl bg-slate-900 border border-slate-900 ${className}`}
        style={{ background: 'rgba(13,20,36,0.5)', borderColor: 'rgba(255,255,255,0.03)' }}
    />
);

const Dashboard = () => {
    const { user } = useAuth();

    // Fetch queries
    const kpisQuery = useKPIs();
    const revenueQuery = useRevenueChart();
    const monthlyQuery = useMonthlyRevenue();
    const statusQuery = useStatusBreakdown();
    const recentQuery = useRecentShipments();
    const clientsQuery = useTopClients();
    const activityQuery = useActivityFeed();
    const delayedQuery = useDelayedShipments();

    const isError =
        kpisQuery.isError ||
        revenueQuery.isError ||
        recentQuery.isError;

    const isLoading =
        kpisQuery.isLoading ||
        revenueQuery.isLoading ||
        recentQuery.isLoading;

    const handleRefreshAll = () => {
        kpisQuery.refetch();
        revenueQuery.refetch();
        monthlyQuery.refetch();
        statusQuery.refetch();
        recentQuery.refetch();
        clientsQuery.refetch();
        activityQuery.refetch();
        delayedQuery.refetch();
    };

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
                    <AlertCircle className="w-6 h-6 text-rose-500" />
                </div>
                <h2 className="text-white font-bold text-lg mb-2">Failed to load dashboard data</h2>
                <p className="text-slate-400 text-sm max-w-sm mb-6">
                    There was an issue connecting to the server. Please verify your connection and try again.
                </p>
                <button
                    onClick={handleRefreshAll}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors shadow-lg"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry Load
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                {/* Header Welcome banner skeleton */}
                <Skeleton className="h-32 w-full" />

                {/* KPI Skeletons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-28 w-full" />
                    ))}
                </div>

                {/* Chart Skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-[340px]" />
                    <Skeleton className="h-[340px]" />
                </div>

                {/* Bottom Row Skeletons */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-[400px]" />
                    <div className="space-y-6">
                        <Skeleton className="h-[200px]" />
                        <Skeleton className="h-[200px]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl p-6 lg:p-7"
                style={{ background: 'linear-gradient(135deg, #0D1424 0%, #15203b 50%, #1c2e59 100%)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
                {/* Accent glow orb */}
                <div
                    className="absolute -top-12 -right-12 w-64 h-64 rounded-full opacity-10 pointer-events-none filter blur-xl"
                    style={{ background: 'radial-gradient(circle, #3b82f6 0%, transparent 70%)' }}
                />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
                            Raipur Hub Operations
                        </p>
                        <h1 className="text-2xl font-bold text-white tracking-tight">
                            Main Command Center
                        </h1>
                        <p className="text-slate-400 text-xs mt-1 max-w-xl">
                            LogiTrack AI helps coordinate Raipur/Bilaspur region freight bookings to destinations across India.
                        </p>
                    </div>

                    <button
                        onClick={handleRefreshAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium text-slate-400 hover:text-white transition-colors self-start md:self-auto"
                        style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Sync Dashboard
                    </button>
                </div>
            </motion.div>

            {/* Delayed Shipments Critical Alert */}
            <DelayedShipmentsAlert data={delayedQuery.data?.data || []} />

            {/* Metrics cards */}
            <KpiCards kpis={kpisQuery.data} delayedCount={delayedQuery.data?.count || 0} />

            {/* Main Graphs section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <RevenueChart data={revenueQuery.data || []} />
                </div>
                <div>
                    <ShipmentStatusChart data={statusQuery.data || []} />
                </div>
            </div>

            {/* Operational Tables and Side Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <RecentShipmentsTable data={recentQuery.data || []} />
                    <MonthlyRevenueChart data={monthlyQuery.data || []} />
                </div>

                <div className="space-y-6">
                    <QuickActions />
                    <TopClientsCard data={clientsQuery.data || []} />
                    <ActivityFeed data={activityQuery.data || []} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
