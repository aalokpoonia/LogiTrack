/**
 * services/shipmentService.js
 *
 * API communication layer for Shipment Operations.
 */

import api from './api';

export const getShipments = async (params = {}) => {
    const { data } = await api.get('/shipments', { params });
    return data;
};

export const getShipment = async (id) => {
    const { data } = await api.get(`/shipments/${id}`);
    return data.data;
};

export const createShipment = async (shipmentData) => {
    const { data } = await api.post('/shipments', shipmentData);
    return data.data;
};

export const updateShipment = async ({ id, ...shipmentData }) => {
    const { data } = await api.put(`/shipments/${id}`, shipmentData);
    return data.data;
};

export const deleteShipment = async (id) => {
    const { data } = await api.delete(`/shipments/${id}`);
    return data;
};

export const getShipmentTimeline = async (id) => {
    const { data } = await api.get(`/shipments/${id}/timeline`);
    return data;
};
