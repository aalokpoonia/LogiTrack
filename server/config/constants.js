/**
 * config/constants.js
 *
 * Central location for all application-wide constants.
 *
 * WHY: Magic strings/numbers scattered across code are a maintenance nightmare.
 * One change here propagates everywhere. Also makes code self-documenting.
 *
 * INTERVIEW QUESTION: "How do you manage configuration across a large Node app?"
 * Answer: Environment variables for secrets, constants file for shared non-secret values.
 */

const ROLES = {
    ADMIN: 'admin',
    OPERATIONS: 'operations',
    ACCOUNTS: 'accounts',
    DRIVER: 'driver',
};

// All valid roles as an array — used for Mongoose enum validation
const ROLE_LIST = Object.values(ROLES);

const TOKEN_CONFIG = {
    ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_SECRET || 'logitrack_access_secret_CHANGE_IN_PROD',
    REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET || 'logitrack_refresh_secret_CHANGE_IN_PROD',
    ACCESS_TOKEN_EXPIRY: '15m',     // Short-lived: 15 minutes
    REFRESH_TOKEN_EXPIRY: '7d',     // Long-lived: 7 days
    COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

const SHIPMENT_STATUS = {
    DRAFT: 'draft',
    CONFIRMED: 'confirmed',
    LOADED: 'loaded',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    POD_RECEIVED: 'pod_received',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
};

const PAYMENT_STATUS = {
    PENDING: 'pending',
    PARTIAL: 'partial',
    PAID: 'paid',
    OVERDUE: 'overdue',
};

module.exports = {
    ROLES,
    ROLE_LIST,
    TOKEN_CONFIG,
    SHIPMENT_STATUS,
    PAYMENT_STATUS,
};
