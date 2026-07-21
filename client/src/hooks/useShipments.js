/**
 * hooks/useShipments.js
 *
 * React Query hooks for Shipment CRUD and timeline operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getShipments,
    getShipment,
    createShipment,
    updateShipment,
    deleteShipment,
    getShipmentTimeline,
} from '../services/shipmentService';

export const useShipments = (params = {}) => {
    return useQuery({
        queryKey: ['shipments', params],
        queryFn: () => getShipments(params),
        placeholderData: (previousData) => previousData, // React Query v5 replacement for keepPreviousData
        staleTime: 30 * 1000,
    });
};

export const useShipment = (id) => {
    return useQuery({
        queryKey: ['shipment', id],
        queryFn: () => getShipment(id),
        enabled: !!id,
    });
};

export const useShipmentTimeline = (id) => {
    return useQuery({
        queryKey: ['shipmentTimeline', id],
        queryFn: () => getShipmentTimeline(id),
        enabled: !!id,
    });
};

export const useCreateShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useUpdateShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateShipment,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['shipment', data._id] });
            queryClient.invalidateQueries({ queryKey: ['shipmentTimeline', data._id] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};

export const useDeleteShipment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteShipment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shipments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
};
