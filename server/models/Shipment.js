/**
 * models/Shipment.js
 *
 * The CORE business entity of LogiTrack — a freight movement order.
 *
 * FREIGHT BROKERAGE ECONOMICS (how LogiTrack makes money):
 * - Client pays: freightCharge (what the shipper pays LogiTrack)
 * - LogiTrack pays: truckOwnerPayment (what LogiTrack pays the truck owner)
 * - Profit per shipment = freightCharge − truckOwnerPayment
 * - LogiTrack's margin is typically 10-20% of the freight charge
 *
 * SHIPMENT LIFECYCLE:
 * booked → loading → in_transit → delivered → pod_received → invoiced → paid
 *
 * KEY CONCEPTS:
 * - LR Number: Lorry Receipt — the legal document for the freight
 * - POD: Proof of Delivery — signed receipt from consignee
 * - GST: Applied on freight charge (5% for road transport under RCM in India)
 * - E-Way Bill: Required for goods worth > ₹50,000 being transported
 */

const mongoose = require('mongoose');

const SHIPMENT_STATUSES = [
    'booked',      // Order received, truck not yet assigned
    'loading',     // Goods being loaded at origin
    'in_transit',  // On the road
    'delivered',   // Reached destination
    'pod_received', // POD signed and received
    'invoiced',    // Invoice raised to client
    'paid',        // Payment received from client
    'cancelled',   // Shipment cancelled
];

const shipmentSchema = new mongoose.Schema(
    {
        // Unique LR (Lorry Receipt) number — auto-generated
        lrNumber: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },

        // ── PARTIES ───────────────────────────────────────────────────────────────
        client: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: [true, 'Client is required'],
        },
        // Truck owner (vendor) — will be a full model in Phase 5
        truckOwnerName: {
            type: String,
            trim: true,
        },
        truckOwnerPhone: {
            type: String,
            trim: true,
        },
        // Driver — will link to Driver model in Phase 5
        driverName: {
            type: String,
            trim: true,
        },
        driverPhone: {
            type: String,
            trim: true,
        },

        // ── VEHICLE ───────────────────────────────────────────────────────────────
        vehicleNumber: {
            type: String,
            uppercase: true,
            trim: true,
        },
        vehicleType: {
            type: String,
            enum: ['open_body', 'closed_body', 'flat_bed', 'refrigerated', 'tanker', 'trailer'],
            default: 'open_body',
        },

        // ── ROUTE ─────────────────────────────────────────────────────────────────
        origin: {
            city: { type: String, required: true },
            state: { type: String },
        },
        destination: {
            city: { type: String, required: true },
            state: { type: String },
        },
        distance: {
            type: Number, // in km
            min: 0,
        },

        // ── GOODS ─────────────────────────────────────────────────────────────────
        goodsDescription: {
            type: String,
            trim: true,
        },
        weight: {
            type: Number, // in tons
            min: 0,
        },
        unit: {
            type: String,
            enum: ['ton', 'kg', 'bags', 'boxes', 'pieces'],
            default: 'ton',
        },
        quantity: Number,
        eWayBillNumber: String,

        // ── FINANCIALS ────────────────────────────────────────────────────────────
        // What the client pays us
        freightCharge: {
            type: Number,
            required: [true, 'Freight charge is required'],
            min: 0,
        },
        // What we pay the truck owner
        truckOwnerPayment: {
            type: Number,
            default: 0,
            min: 0,
        },
        // Additional charges (loading, unloading, toll, etc.)
        additionalCharges: {
            type: Number,
            default: 0,
        },
        // GST (5% for road transport in India)
        gstAmount: {
            type: Number,
            default: 0,
        },
        // Total invoice amount = freightCharge + additionalCharges + gstAmount
        totalAmount: {
            type: Number,
            default: 0,
        },
        // LogiTrack's profit on this shipment
        profit: {
            type: Number,
            default: 0,
        },
        // Payment status from client
        paymentStatus: {
            type: String,
            enum: ['pending', 'partial', 'paid'],
            default: 'pending',
        },
        amountPaid: {
            type: Number,
            default: 0,
        },

        // ── DATES ─────────────────────────────────────────────────────────────────
        bookingDate: {
            type: Date,
            default: Date.now,
        },
        expectedDeliveryDate: Date,
        actualDeliveryDate: Date,
        podReceivedDate: Date,
        invoiceDate: Date,
        paymentDate: Date,

        // ── STATUS ────────────────────────────────────────────────────────────────
        status: {
            type: String,
            enum: SHIPMENT_STATUSES,
            default: 'booked',
        },

        // ── DOCUMENTS ─────────────────────────────────────────────────────────────
        invoiceNumber: String,
        podImageUrl: String,
        notes: String,

        statusHistory: [
            {
                status: { type: String, required: true },
                timestamp: { type: Date, default: Date.now },
                updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                notes: String,
            },
        ],

        isDeleted: {
            type: Boolean,
            default: false,
        },
        // ── AUDIT ─────────────────────────────────────────────────────────────────
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        updatedBy: {
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

// ── PRE-VALIDATE: auto-generate unique LR number if not provided ────────────────
shipmentSchema.pre('validate', function (next) {
    if (!this.lrNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const rand = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
        this.lrNumber = `LR-${year}-${rand}`;
    }
    next();
});

// ── PRE-SAVE: auto-calculate profit and totalAmount ────────────────────────
shipmentSchema.pre('save', function (next) {
    this.totalAmount = this.freightCharge + (this.additionalCharges || 0) + (this.gstAmount || 0);
    this.profit = this.freightCharge - (this.truckOwnerPayment || 0);

    if (this.isNew || !this.statusHistory || this.statusHistory.length === 0) {
        this.statusHistory = [{
            status: this.status || 'booked',
            timestamp: new Date(),
            updatedBy: this.createdBy,
            notes: 'Shipment created and booked',
        }];
    }
    next();
});

// ── INDEXES for dashboard aggregation queries ──────────────────────────────
shipmentSchema.index({ status: 1, bookingDate: -1 });
shipmentSchema.index({ client: 1, bookingDate: -1 });
shipmentSchema.index({ bookingDate: -1 });
shipmentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Shipment', shipmentSchema);
module.exports.SHIPMENT_STATUSES = SHIPMENT_STATUSES;
