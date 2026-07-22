/**
 * hooks/useDashboard.js
 *
 * React Query hooks for dashboard data.
 *
 * WHY REACT QUERY?
 * - Automatic caching — same data shared across components without re-fetching
 * - Background refetch — keeps data fresh without blocking UI
 * - Loading/error states — built in, no manual useState/useEffect boilerplate
 * - Stale-while-revalidate — shows cached data immediately while fetching fresh
 *
 * REFETCH STRATEGY:
 * KPIs refetch every 60s (business-critical, needs freshness).
 * Charts refetch every 5 minutes (historical data, less volatile).
 * Tables refetch every 2 minutes (reasonable middle ground).
 */

import { useQuery } from '@tanstack/react-query';
import {
    fetchKPIs,
    fetchRevenueChart,
    fetchMonthlyRevenue,
    fetchStatusBreakdown,
    fetchRecentShipments,
    fetchTopClients,
    fetchActivityFeed,
    fetchDelayedShipments,
} from '../services/dashboardService';

export const useKPIs = () =>
    useQuery({
        queryKey: ['dashboard', 'kpis'],
        queryFn: fetchKPIs,
        refetchInterval: 60 * 1000, // 60 seconds
        staleTime: 30 * 1000,
    });

export const useRevenueChart = (range = 'this_month') =>
    useQuery({
        queryKey: ['dashboard', 'revenue-chart', range],
        queryFn: () => fetchRevenueChart(range),
        staleTime: 5 * 60 * 1000,
    });

export const useMonthlyRevenue = () =>
    useQuery({
        queryKey: ['dashboard', 'monthly-revenue'],
        queryFn: fetchMonthlyRevenue,
        staleTime: 5 * 60 * 1000,
    });

export const useStatusBreakdown = () =>
    useQuery({
        queryKey: ['dashboard', 'status-breakdown'],
        queryFn: fetchStatusBreakdown,
        staleTime: 2 * 60 * 1000,
    });

export const useRecentShipments = () =>
    useQuery({
        queryKey: ['dashboard', 'recent-shipments'],
        queryFn: fetchRecentShipments,
        refetchInterval: 2 * 60 * 1000,
        staleTime: 60 * 1000,
    });

export const useTopClients = () =>
    useQuery({
        queryKey: ['dashboard', 'top-clients'],
        queryFn: fetchTopClients,
        staleTime: 5 * 60 * 1000,
    });

export const useActivityFeed = () =>
    useQuery({
        queryKey: ['dashboard', 'activity-feed'],
        queryFn: fetchActivityFeed,
        refetchInterval: 90 * 1000,
        staleTime: 60 * 1000,
    });

export const useDelayedShipments = () =>
    useQuery({
        queryKey: ['dashboard', 'delayed-shipments'],
        queryFn: fetchDelayedShipments,
        refetchInterval: 2 * 60 * 1000,
        staleTime: 60 * 1000,
    });
