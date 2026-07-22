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

export const uploadShipmentPOD = async ({ id, file }) => {
    const formData = new FormData();
    formData.append('pod', file);
    const { data } = await api.post(`/shipments/${id}/pod`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return data;
};

export const getShipmentLRPdfUrl = (id) => {
    const baseURL = api.defaults.baseURL || '/api';
    return `${baseURL}/shipments/${id}/pdf/lr`;
};

export const getShipmentInvoicePdfUrl = (id) => {
    const baseURL = api.defaults.baseURL || '/api';
    return `${baseURL}/shipments/${id}/pdf/invoice`;
};

