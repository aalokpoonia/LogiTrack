/**
 * constants/routes.js
 *
 * All frontend route paths in one place.
 *
 * WHY: If you hardcode '/dashboard' in 20 components and rename it to '/app',
 * you have 20 places to change. With this file, you change one string.
 * This is the DRY principle applied to routing.
 */

export const ROUTES = {
    // Auth
    LOGIN: '/login',

    // Dashboard
    DASHBOARD: '/dashboard',

    // Module routes (to be added in future phases)
    CLIENTS: '/clients',
    TRUCK_OWNERS: '/truck-owners',
    DRIVERS: '/drivers',
    VEHICLES: '/vehicles',
    SHIPMENTS: '/shipments',
    BILLING: '/billing',
    INVOICES: '/invoices',
    ANALYTICS: '/analytics',
    REPORTS: '/reports',
    NOTIFICATIONS: '/notifications',
    SETTINGS: '/settings',
    USERS: '/users',
    GPS_TRACKING: '/tracking',
    AI_ASSISTANT: '/ai',

    // Special
    NOT_FOUND: '*',
};
