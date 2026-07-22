/**
 * services/reportService.js
 *
 * API communication layer for Reports & Business Analytics.
 */

import api from './api';

export const getAnalytics = async (params = {}) => {
    const { data } = await api.get('/reports/analytics', { params });
    return data;
};

export const getExportCSVUrl = (params = {}) => {
    const baseURL = api.defaults.baseURL || '/api';
    const query = new URLSearchParams(params).toString();
    return `${baseURL}/reports/export${query ? `?${query}` : ''}`;
};
