/**
 * services/trackingService.js
 *
 * API communication layer for Real-Time GPS Tracking.
 */

import api from './api';

export const getActiveTrackedShipments = async () => {
    const { data } = await api.get('/tracking/active');
    return data;
};

export const postLocationUpdate = async (shipmentId, locationData) => {
    const { data } = await api.post(`/tracking/${shipmentId}/location`, locationData);
    return data;
};
