/**
 * services/userService.js
 *
 * API communication layer for User Management and profile settings.
 */

import api from './api';

export const getUsers = async () => {
    const { data } = await api.get('/auth/users');
    return data;
};

export const registerUser = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
};

export const updateUserRole = async ({ id, role }) => {
    const { data } = await api.put(`/auth/users/${id}/role`, { role });
    return data;
};

export const toggleUserStatus = async (id) => {
    const { data } = await api.put(`/auth/users/${id}/status`);
    return data;
};

export const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    return data;
};
