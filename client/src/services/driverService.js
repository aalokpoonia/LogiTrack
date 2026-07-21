/**
 * services/driverService.js
 *
 * API communication layer for Driver Management.
 */

import api from './api';

export const getDrivers = async (params = {}) => {
    const { data } = await api.get('/drivers', { params });
    return data;
};

export const getDriver = async (id) => {
    const { data } = await api.get(`/drivers/${id}`);
    return data.data;
};

export const createDriver = async (driverData) => {
    const { data } = await api.post('/drivers', driverData);
    return data.data;
};

export const updateDriver = async ({ id, ...driverData }) => {
    const { data } = await api.put(`/drivers/${id}`, driverData);
    return data.data;
};

export const deleteDriver = async (id) => {
    const { data } = await api.delete(`/drivers/${id}`);
    return data;
};
