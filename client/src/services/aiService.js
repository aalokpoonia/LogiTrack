/**
 * services/aiService.js
 *
 * API communication layer for Gemini AI Logistics Assistant.
 */

import api from './api';

export const queryAIAssistant = async (prompt) => {
    const { data } = await api.post('/ai/query', { prompt });
    return data;
};
