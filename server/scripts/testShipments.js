/**
 * scripts/testShipments.js
 *
 * Automated verification script for Shipment Operations (Phase 5) API endpoints.
 * Simulates shipment CRUD cycles, auto-calculations, status history, and timeline.
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Client = require('../models/Client');
const Shipment = require('../models/Shipment');

dotenv.config();

const runTests = async () => {
    console.log('🧪 Starting Phase 5 Shipment Operations backend tests...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB.');

    // Pre-requisite: Create a test client
    console.log('➡️ Setting up test client...');
    const testClientData = {
        companyName: 'Raipur Steel & Power Ltd',
        contactPerson: 'Rahul Sharma',
        email: 'rahul.sharma@raipursteel.com',
        phone: '9888777666',
        creditLimit: 1000000,
        notes: 'Verification test client for Shipments',
    };

    await Client.deleteMany({ email: testClientData.email });
    const client = await Client.create(testClientData);
    console.log(`   - Client created successfully (ID: ${client._id})`);

    // 1. Shipment Booking Test
    console.log('➡️ Testing Shipment Booking (Create)...');
    const testShipmentData = {
        client: client._id,
        vehicleNumber: 'CG04JD5678',
        vehicleType: 'trailer',
        driverName: 'Dilip Yadav',
        driverPhone: '9876543211',
        origin: { city: 'Raipur', state: 'Chhattisgarh' },
        destination: { city: 'Bilaspur', state: 'Chhattisgarh' },
        distance: 120,
        goodsDescription: 'Reinforcement Steel Bars',
        weight: 15.5,
        unit: 'ton',
        quantity: 1,
        freightCharge: 45000,
        truckOwnerPayment: 38000,
        additionalCharges: 1500,
        gstAmount: 2250, // 5% of 45000 is 2250
        notes: 'Urgent reinforcement steel delivery',
    };

    // Cleanup any left overs of CG04JD5678
    await Shipment.deleteMany({ vehicleNumber: 'CG04JD5678' });

    const createdShipment = await Shipment.create(testShipmentData);
    if (!createdShipment) {
        throw new Error('Shipment booking failed');
    }

    console.log(`   - Shipment created successfully with LR Number: ${createdShipment.lrNumber}`);
    
    // Check auto-calculations
    // totalAmount = freightCharge + additionalCharges + gstAmount = 45000 + 1500 + 2250 = 48750
    // profit = freightCharge - truckOwnerPayment = 45000 - 38000 = 7000
    if (createdShipment.totalAmount !== 48750) {
        throw new Error(`Auto-calculation of totalAmount failed. Expected 48750, got ${createdShipment.totalAmount}`);
    }
    if (createdShipment.profit !== 7000) {
        throw new Error(`Auto-calculation of profit failed. Expected 7000, got ${createdShipment.profit}`);
    }
    console.log(`   - Auto-calculations verified: Total = ${createdShipment.totalAmount}, Profit = ${createdShipment.profit}`);

    // Verify initial status history
    if (!createdShipment.statusHistory || createdShipment.statusHistory.length !== 1) {
        throw new Error('Initial statusHistory timeline entry was not created');
    }
    if (createdShipment.statusHistory[0].status !== 'booked') {
        throw new Error(`Expected initial status to be "booked", got: ${createdShipment.statusHistory[0].status}`);
    }
    console.log('   - Initial timeline history verified successfully.');

    // 2. Shipment Status Update and Timeline Verification
    console.log('➡️ Testing Shipment Status Transition...');
    
    // Transition to loading
    createdShipment.status = 'loading';
    createdShipment.statusHistory.push({
        status: 'loading',
        timestamp: new Date(),
        notes: 'Vehicle reached Raipur steel plant for loading',
    });
    
    await createdShipment.save();
    
    const updatedShipment = await Shipment.findById(createdShipment._id);
    if (updatedShipment.status !== 'loading') {
        throw new Error(`Status transition failed. Expected loading, got ${updatedShipment.status}`);
    }
    if (updatedShipment.statusHistory.length !== 2) {
        throw new Error(`Expected status history timeline length to be 2, got ${updatedShipment.statusHistory.length}`);
    }
    console.log('   - Status transitioned to "loading" and timeline successfully updated.');

    // 3. Soft Delete Test
    console.log('➡️ Testing Shipment Soft Delete...');
    updatedShipment.isDeleted = true;
    await updatedShipment.save();

    const deletedCheck = await Shipment.findOne({ _id: createdShipment._id, isDeleted: false });
    if (deletedCheck) {
        throw new Error('Soft-deleted shipment is still appearing in active queries');
    }
    console.log('   - Shipment soft-deleted successfully.');

    // Cleanup test data
    await Client.deleteMany({ email: testClientData.email });
    await Shipment.deleteMany({ vehicleNumber: 'CG04JD5678' });

    console.log('✨ All Phase 5 Shipment Operations backend tests passed successfully!');
    process.exit(0);
};

runTests().catch(err => {
    console.error('❌ Tests failed:', err.message);
    process.exit(1);
});
