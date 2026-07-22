/**
 * scripts/seedMasters.js
 *
 * Seeds the database with a small set of active client, broker, vehicle,
 * and driver records so shipment booking dropdowns have data to populate.
 *
 * RUN: cd server && node scripts/seedMasters.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Client = require('../models/Client');
const Broker = require('../models/Broker');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

const CLIENTS = [
    {
        companyName: 'ACC Cement Ltd',
        contactPerson: 'Rajesh Agarwal',
        email: 'dispatch@acccement.com',
        phone: '7712345001',
        gstNumber: '22AABCA1234F1ZL',
        pan: 'AABCA1234F',
        address: { street: 'Jamul Cement Works', city: 'Raipur', state: 'Chhattisgarh', pincode: '490024' },
        creditLimit: 500000,
    },
    {
        companyName: 'Ambuja Cement',
        contactPerson: 'Sunil Tiwari',
        email: 'logistics@ambuja.com',
        phone: '7712345002',
        gstNumber: '22AABCA5678G1ZP',
        pan: 'AABCA5678G',
        address: { street: 'Bhatapara Plant', city: 'Raipur', state: 'Chhattisgarh', pincode: '493118' },
        creditLimit: 600000,
    },
    {
        companyName: 'JK Lakshmi Cement',
        contactPerson: 'Manoj Sharma',
        email: 'transport@jklakshmi.com',
        phone: '7712345003',
        gstNumber: '22BBJKL9012H1ZQ',
        pan: 'BBJKL9012H',
        address: { street: 'Durg Industrial Area', city: 'Durg', state: 'Chhattisgarh', pincode: '491001' },
        creditLimit: 400000,
    },
];

const BROKERS = [
    {
        name: 'Raipur Roadlines',
        ownerName: 'Harpreet Singh',
        phone: '9123456789',
        accountDetails: { bankName: 'HDFC Bank', accountNo: '123456789012', ifscCode: 'HDFC0001234' },
    },
    {
        name: 'Sharma Transport Co',
        ownerName: 'Amit Sharma',
        phone: '9876543210',
        accountDetails: { bankName: 'ICICI Bank', accountNo: '234567890123', ifscCode: 'ICIC0002345' },
    },
];

const VEHICLES = [
    {
        vehicleNumber: 'CG04JD1234',
        vehicleType: 'open_body',
        ownerName: 'Vikas Sahu',
        ownerPhone: '8887776665',
    },
    {
        vehicleNumber: 'CG05AB5678',
        vehicleType: 'closed_body',
        ownerName: 'Anil Dubey',
        ownerPhone: '7776665554',
    },
    {
        vehicleNumber: 'MP06CD9012',
        vehicleType: 'flat_bed',
        ownerName: 'Ranjeet Yadav',
        ownerPhone: '6665554443',
    },
];

const DRIVERS = [
    {
        name: 'Ramesh Kumar',
        phone: '9988776601',
        licenseNumber: 'CG0420180012345',
        licenseExpiry: new Date('2032-12-31T00:00:00.000Z'),
        verificationStatus: 'approved',
    },
    {
        name: 'Suresh Yadav',
        phone: '9988776602',
        licenseNumber: 'CG0520190012345',
        licenseExpiry: new Date('2031-10-15T00:00:00.000Z'),
        verificationStatus: 'approved',
    },
    {
        name: 'Mohan Lal',
        phone: '9988776603',
        licenseNumber: 'MP0620200012345',
        licenseExpiry: new Date('2030-09-20T00:00:00.000Z'),
        verificationStatus: 'pending',
    },
];

const upsertMany = async (Model, records, uniqueField) => {
    let processed = 0;
    for (const record of records) {
        const filter = { [uniqueField]: record[uniqueField] };
        const existing = await Model.findOne(filter);

        if (existing) {
            Object.assign(existing, { ...record, isActive: true, isDeleted: false });
            await existing.save();
        } else {
            await Model.create({ ...record, isActive: true, isDeleted: false });
        }

        processed += 1;
    }
    return processed;
};

const seedMasters = async () => {
    try {
        await connectDB();
        console.log('🌱 Seeding active master data for shipments...');

        const clientCount = await upsertMany(Client, CLIENTS, 'email');
        const brokerCount = await upsertMany(Broker, BROKERS, 'name');
        const vehicleCount = await upsertMany(Vehicle, VEHICLES, 'vehicleNumber');
        const driverCount = await upsertMany(Driver, DRIVERS, 'licenseNumber');

        console.log(`✅ Seeded ${clientCount} clients, ${brokerCount} brokers, ${vehicleCount} vehicles, and ${driverCount} drivers.`);
    } catch (error) {
        console.error('❌ Master seeding failed:', error.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
    }
};

seedMasters();
