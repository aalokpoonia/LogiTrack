/**
 * hooks/useClients.js
 *
 * React Query hooks for Client (Party) CRUD operations.
 * Implements auto-invalidation of lists upon create, update, or delete.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getClients,
    getClient,
    createClient,
    updateClient,
    deleteClient,
} from '../services/clientService';

export const useClients = (params = {}) => {
    return useQuery({
        queryKey: ['clients', params],
        queryFn: () => getClients(params),
        keepPreviousData: true,
        staleTime: 30 * 1000,
    });
};

export const useClient = (id) => {
    return useQuery({
        queryKey: ['client', id],
        queryFn: () => getClient(id),
        enabled: !!id,
    });
};

export const useCreateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries(['clients']);
            queryClient.invalidateQueries(['dashboard', 'kpis']); // KPIs might depend on client counts
        },
    });
};

export const useUpdateClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateClient,
        onSuccess: (data) => {
            queryClient.invalidateQueries(['clients']);
            queryClient.invalidateQueries(['client', data._id]);
        },
    });
};

export const useDeleteClient = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteClient,
        onSuccess: () => {
            queryClient.invalidateQueries(['clients']);
            queryClient.invalidateQueries(['dashboard', 'kpis']);
        },
    });
};
