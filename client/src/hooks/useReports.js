/**
 * hooks/useReports.js
 *
 * React Query hooks for reports and business analytics dashboards.
 */

import { useQuery } from '@tanstack/react-query';
import { getAnalytics } from '../services/reportService';

export const useAnalytics = (params = {}) => {
    return useQuery({
        queryKey: ['analytics', params],
        queryFn: () => getAnalytics(params),
        placeholderData: (previousData) => previousData,
        staleTime: 60 * 1000, // 1 minute stale time for analytics
    });
};
