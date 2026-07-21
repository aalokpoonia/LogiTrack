/**
 * hooks/useVehicles.js
 *
 * React Query hooks for Vehicle CRUD operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getVehicles,
    getVehicle,
    createVehicle,
    updateVehicle,
    deleteVehicle,
} from '../services/vehicleService';

export const useVehicles = (params = {}) => {
    return useQuery({
        queryKey: ['vehicles', params],
        queryFn: () => getVehicles(params),
        keepPreviousData: true,
        staleTime: 30 * 1000,
    });
};

export const useVehicle = (id) => {
    return useQuery({
        queryKey: ['vehicle', id],
        queryFn: () => getVehicle(id),
        enabled: !!id,
    });
};

export const useCreateVehicle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries(['vehicles']);
            queryClient.invalidateQueries(['dashboard', 'kpis']);
        },
    });
};

export const useUpdateVehicle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateVehicle,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['vehicles']);
            queryClient.invalidateQueries(['vehicle', data._id]);
        },
    });
};

export const useDeleteVehicle = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteVehicle,
        onSuccess: () => {
            queryClient.invalidateQueries(['vehicles']);
            queryClient.invalidateQueries(['dashboard', 'kpis']);
        },
    });
};
