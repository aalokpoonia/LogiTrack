/**
 * services/clientService.js
 *
 * API communication layer for Client (Party) Management.
 * Implements CRUD actions with pagination, searching, and filtering.
 */

import api from './api';

export const getClients = async (params = {}) => {
    const { data } = await api.get('/clients', { params });
    return data;
};

export const getClient = async (id) => {
    const { data } = await api.get(`/clients/${id}`);
    return data.data;
};

export const createClient = async (clientData) => {
    const { data } = await api.post('/clients', clientData);
    return data.data;
};

export const updateClient = async ({ id, ...clientData }) => {
    const { data } = await api.put(`/clients/${id}`, clientData);
    return data.data;
};

export const deleteClient = async (id) => {
    const { data } = await api.delete(`/clients/${id}`);
    return data;
};
