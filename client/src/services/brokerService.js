/**
 * services/brokerService.js
 *
 * API communication layer for Broker Management.
 * Implements CRUD actions with pagination, searching, and filtering.
 */

import api from './api';

export const getBrokers = async (params = {}) => {
    const { data } = await api.get('/brokers', { params });
    return data;
};

export const getBroker = async (id) => {
    const { data } = await api.get(`/brokers/${id}`);
    return data.data;
};

export const createBroker = async (brokerData) => {
    const { data } = await api.post('/brokers', brokerData);
    return data.data;
};

export const updateBroker = async ({ id, ...brokerData }) => {
    const { data } = await api.put(`/brokers/${id}`, brokerData);
    return data.data;
};

export const deleteBroker = async (id) => {
    const { data } = await api.delete(`/brokers/${id}`);
    return data;
};
