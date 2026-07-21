/**
 * hooks/useDrivers.js
 *
 * React Query hooks for Driver CRUD operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getDrivers,
    getDriver,
    createDriver,
    updateDriver,
    deleteDriver,
} from '../services/driverService';

export const useDrivers = (params = {}) => {
    return useQuery({
        queryKey: ['drivers', params],
        queryFn: () => getDrivers(params),
        keepPreviousData: true,
        staleTime: 30 * 1000,
    });
};

export const useDriver = (id) => {
    return useQuery({
        queryKey: ['driver', id],
        queryFn: () => getDriver(id),
        enabled: !!id,
    });
};

export const useCreateDriver = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDriver,
        onSuccess: () => {
            queryClient.invalidateQueries(['drivers']);
            queryClient.invalidateQueries(['dashboard', 'kpis']);
        },
    });
};

export const useUpdateDriver = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateDriver,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['drivers']);
            queryClient.invalidateQueries(['driver', data._id]);
        },
    });
};

export const useDeleteDriver = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDriver,
        onSuccess: () => {
            queryClient.invalidateQueries(['drivers']);
            queryClient.invalidateQueries(['dashboard', 'kpis']);
        },
    });
};
