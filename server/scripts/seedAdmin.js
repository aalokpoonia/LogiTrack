/**
 * scripts/seedAdmin.js
 *
 * One-time admin user seeder.
 *
 * PURPOSE: Creates the first admin account when deploying to a new environment.
 * Without this, there's no way to log in and create users via the /register endpoint
 * (which requires admin auth).
 *
 * USAGE:
 *   cd server
 *   node scripts/seedAdmin.js
 *
 * IMPORTANT: Run this ONCE per environment. Running again will skip if admin exists.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await User.findOne({ role: 'admin' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists:', existingAdmin.email);
            process.exit(0);
        }

        const admin = await User.create({
            name: 'LogiTrack Administrator',
            email: 'admin@logitrack.com',
            password: 'Admin@1234',
            role: 'admin',
            phone: '9876543210',
        });

        console.log('✅ Admin user created successfully!');
        console.log('   Email:    admin@logitrack.com');
        console.log('   Password: Admin@1234');
        console.log('   ⚠️  CHANGE THE PASSWORD IMMEDIATELY after first login!');
        console.log('   ID:', admin._id);

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
};

seedAdmin();
