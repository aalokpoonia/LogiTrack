/**
 * services/vehicleService.js
 *
 * API communication layer for Vehicle Management.
 */

import api from './api';

export const getVehicles = async (params = {}) => {
    const { data } = await api.get('/vehicles', { params });
    return data;
};

export const getVehicle = async (id) => {
    const { data } = await api.get(`/vehicles/${id}`);
    return data.data;
};

export const createVehicle = async (vehicleData) => {
    const { data } = await api.post('/vehicles', vehicleData);
    return data.data;
};

export const updateVehicle = async ({ id, ...vehicleData }) => {
    const { data } = await api.put(`/vehicles/${id}`, vehicleData);
    return data.data;
};

export const deleteVehicle = async (id) => {
    const { data } = await api.delete(`/vehicles/${id}`);
    return data;
};
