/**
 * models/Driver.js
 *
 * Driver represents a truck driver. Compliance details (license etc) are
 * captured to prevent bookings with expired licenses.
 */

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Driver name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Driver phone number is required'],
            trim: true,
        },
        alternatePhone: {
            type: String,
            trim: true,
        },
        licenseNumber: {
            type: String,
            required: [true, 'License number is required'],
            uppercase: true,
            trim: true,
        },
        licenseExpiry: {
            type: Date,
            required: [true, 'License expiry date is required'],
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
driverSchema.index({ name: 'text', licenseNumber: 1 });
driverSchema.index({ isDeleted: 1, isActive: 1 });

module.exports = mongoose.model('Driver', driverSchema);
