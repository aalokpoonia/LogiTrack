/**
 * models/User.js
 *
 * Mongoose schema for the User collection.
 *
 * WHY MONGOOSE?
 * MongoDB is schemaless, but that's a risk in production.
 * Mongoose adds a schema layer that enforces data shape, types, and validation
 * before anything reaches the database.
 *
 * KEY DESIGN DECISIONS:
 *
 * 1. select: false on password
 *    Every query auto-excludes the password. You must explicitly call
 *    .select('+password') only when comparing it during login.
 *    This prevents accidental password exposure in any API response.
 *
 * 2. Pre-save hook for hashing
 *    We hash the password in a model hook, not in the controller.
 *    This means passwords are always hashed regardless of which controller
 *    creates or updates a user — no risk of forgetting.
 *
 * 3. Instance method: matchPassword
 *    Business logic that belongs to the User entity lives on the User model.
 *    Controllers stay thin — they just call user.matchPassword(inputPassword).
 *
 * INTERVIEW QUESTION: "What is bcrypt and why use it over MD5/SHA?"
 * bcrypt is a slow, intentionally expensive hashing algorithm with a salt built in.
 * MD5/SHA are fast — which is BAD for passwords (faster = easier brute force).
 * bcrypt's cost factor (saltRounds) lets you increase difficulty as hardware improves.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_LIST, ROLES } = require('../config/constants');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true, // Creates a unique index in MongoDB for fast lookups
            lowercase: true, // Always stored as lowercase — prevents "User@Example.com" duplicates
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email address',
            ],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // ← KEY: Never returned in queries unless explicitly requested
        },
        role: {
            type: String,
            enum: {
                values: ROLE_LIST,
                message: `Role must be one of: ${ROLE_LIST.join(', ')}`,
            },
            default: ROLES.OPERATIONS,
        },
        phone: {
            type: String,
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian phone number'],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLogin: {
            type: Date,
        },
        // Profile avatar URL (will be a file path after Multer upload in later phases)
        avatar: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// ─── PRE-SAVE HOOK ──────────────────────────────────────────────────────────
// Runs before every .save() call.
// We only hash if the password field was actually changed (not on profile updates).
userSchema.pre('save', async function (next) {
    // 'this' refers to the document being saved
    if (!this.isModified('password')) {
        return next();
    }
    // saltRounds: 12 is industry standard. Higher = more secure but slower.
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ─── INSTANCE METHOD ─────────────────────────────────────────────────────────
// Called as: const isMatch = await user.matchPassword(inputPassword);
// We use bcrypt.compare() — it compares the plaintext input against the stored hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// ─── TRANSFORM ────────────────────────────────────────────────────────────────
// When converting to JSON (for API responses), remove __v and never send password
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        delete ret.__v;
        delete ret.password;
        return ret;
    },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
