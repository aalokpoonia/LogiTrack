/**
 * models/Client.js
 *
 * Clients are the companies that hire LogiTrack to move their freight.
 * They are the revenue source — every shipment belongs to a client.
 *
 * BUSINESS CONTEXT:
 * In freight brokerage, a "client" is the shipper — the company with goods to move.
 * LogiTrack acts as the broker: finds a truck owner, negotiates the rate, takes a margin.
 *
 * KEY FIELDS:
 * - contactPerson: The individual we communicate with at the client company
 * - creditLimit: How much freight they can book without paying upfront
 * - outstandingBalance: What they currently owe LogiTrack
 * - gstNumber: Required for generating valid invoices in India
 */

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
    {
        // Company Details
        companyName: {
            type: String,
            required: [true, 'Company name is required'],
            trim: true,
            maxlength: [100, 'Company name cannot exceed 100 characters'],
        },
        contactPerson: {
            type: String,
            required: [true, 'Contact person name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
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

        // Business / GST Details
        gstNumber: {
            type: String,
            uppercase: true,
            trim: true,
        },
        pan: {
            type: String,
            uppercase: true,
            trim: true,
        },

        // Address
        address: {
            street: String,
            city: String,
            state: String,
            pincode: String,
        },

        // Financial
        creditLimit: {
            type: Number,
            default: 0,
            min: 0,
        },
        outstandingBalance: {
            type: Number,
            default: 0,
        },
        totalRevenue: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Operational
        totalShipments: {
            type: Number,
            default: 0,
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

        // Who created this record
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// Virtual: creditUtilisation percentage
clientSchema.virtual('creditUtilisation').get(function () {
    if (!this.creditLimit || this.creditLimit === 0) return 0;
    return Math.round((this.outstandingBalance / this.creditLimit) * 100);
});

// Index for fast lookups
clientSchema.index({ companyName: 'text', email: 1 });
clientSchema.index({ isActive: 1, totalRevenue: -1 });
clientSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Client', clientSchema);
