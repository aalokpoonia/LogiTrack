/**
 * hooks/useBrokers.js
 *
 * React Query hooks for Broker CRUD operations.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getBrokers,
    getBroker,
    createBroker,
    updateBroker,
    deleteBroker,
} from '../services/brokerService';

export const useBrokers = (params = {}) => {
    return useQuery({
        queryKey: ['brokers', params],
        queryFn: () => getBrokers(params),
        keepPreviousData: true,
        staleTime: 30 * 1000,
    });
};

export const useBroker = (id) => {
    return useQuery({
        queryKey: ['broker', id],
        queryFn: () => getBroker(id),
        enabled: !!id,
    });
};

export const useCreateBroker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createBroker,
        onSuccess: () => {
            queryClient.invalidateQueries(['brokers']);
        },
    });
};

export const useUpdateBroker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateBroker,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['brokers']);
            queryClient.invalidateQueries(['broker', data._id]);
        },
    });
};

export const useDeleteBroker = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteBroker,
        onSuccess: () => {
            queryClient.invalidateQueries(['brokers']);
        },
    });
};
