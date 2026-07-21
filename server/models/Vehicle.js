/**
 * models/Vehicle.js
 *
 * Vehicle represents a truck in our command system (owned or third-party market vehicle).
 */

const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema(
    {
        vehicleNumber: {
            type: String,
            required: [true, 'Vehicle number is required'],
            unique: true,
            uppercase: true,
            trim: true,
            // Match typical Indian vehicle plate format (e.g. CG04JD1234 or CG 04 JD 1234)
            validate: {
                validator: function (v) {
                    const cleanValue = v.replace(/\s+/g, '');
                    return /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{4}$/.test(cleanValue);
                },
                message: (props) => `${props.value} is not a valid Indian vehicle registration number!`,
            },
        },
        vehicleType: {
            type: String,
            required: [true, 'Vehicle type is required'],
            enum: ['open_body', 'closed_body', 'flat_bed', 'trailer', 'container', 'lorry', 'dumper'],
        },
        ownerName: {
            type: String,
            required: [true, 'Owner name is required'],
            trim: true,
        },
        ownerPhone: {
            type: String,
            required: [true, 'Owner phone is required'],
            trim: true,
        },
        // Expiry details (crucial compliance checks for logistics)
        rcExpiry: Date,
        fitnessExpiry: Date,
        insuranceExpiry: Date,
        permitExpiry: Date,

        notes: {
            type: String,
            maxlength: 500,
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

// Format number before saving (remove spaces)
vehicleSchema.pre('save', function (next) {
    if (this.vehicleNumber) {
        this.vehicleNumber = this.vehicleNumber.replace(/\s+/g, '').toUpperCase();
    }
    next();
});

// Indexes
vehicleSchema.index({ isDeleted: 1, isActive: 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);
