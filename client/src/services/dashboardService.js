/**
 * services/dashboardService.js
 *
 * API functions for all dashboard endpoints.
 * Each function returns the data payload from the API response.
 *
 * WHY SEPARATE SERVICE?
 * Keeps API communication isolated from UI components.
 * If endpoint URLs change, fix them here — not in 10 components.
 */

import api from './api';

export const fetchKPIs = async () => {
    const { data } = await api.get('/dashboard/kpis');
    return data.data;
};

export const fetchRevenueChart = async () => {
    const { data } = await api.get('/dashboard/revenue-chart');
    return data.data;
};

export const fetchMonthlyRevenue = async () => {
    const { data } = await api.get('/dashboard/monthly-revenue');
    return data.data;
};

export const fetchStatusBreakdown = async () => {
    const { data } = await api.get('/dashboard/status-breakdown');
    return data.data;
};

export const fetchRecentShipments = async () => {
    const { data } = await api.get('/dashboard/recent-shipments');
    return data.data;
};

export const fetchTopClients = async () => {
    const { data } = await api.get('/dashboard/top-clients');
    return data.data;
};

export const fetchActivityFeed = async () => {
    const { data } = await api.get('/dashboard/activity-feed');
    return data.data;
};

export const fetchDelayedShipments = async () => {
    const { data } = await api.get('/dashboard/delayed-shipments');
    return data;
};
