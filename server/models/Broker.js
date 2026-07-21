/**
 * models/Broker.js
 *
 * Broker represents a truck provider or market broker from whom we source trucks.
 * They are key vendors for freight brokerage operations.
 */

const mongoose = require('mongoose');

const brokerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Broker company name is required'],
            trim: true,
            maxlength: [100, 'Broker name cannot exceed 100 characters'],
        },
        ownerName: {
            type: String,
            required: [true, 'Owner name is required'],
            trim: true,
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            trim: true,
        },
        alternatePhone: {
            type: String,
            trim: true,
        },
        pan: {
            type: String,
            uppercase: true,
            trim: true,
        },
        accountDetails: {
            bankName: String,
            accountNo: String,
            ifscCode: String,
            accountHolder: String,
        },
        outstandingBalance: {
            type: Number,
            default: 0,
        },
        totalPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalTrips: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            maxlength: 500,
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
brokerSchema.index({ name: 'text', ownerName: 'text' });
brokerSchema.index({ isDeleted: 1, isActive: 1 });

module.exports = mongoose.model('Broker', brokerSchema);
