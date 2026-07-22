/**
 * hooks/useAI.js
 *
 * React Query mutation hooks for the AI Logistics Assistant.
 */

import { useMutation } from '@tanstack/react-query';
import { queryAIAssistant } from '../services/aiService';

export const useQueryAssistant = () => {
    return useMutation({
        mutationFn: ({ prompt }) => queryAIAssistant(prompt),
    });
};
