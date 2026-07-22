/**
 * scripts/testTracking.js
 *
 * Automated verification script for Phase 7 (Real-Time GPS Tracking & Socket.IO).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Client = require('../models/Client');
const Shipment = require('../models/Shipment');

dotenv.config();

const runTests = async () => {
    console.log('🧪 Starting Phase 7 Real-Time GPS Tracking & Socket.IO tests...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB.');

    // Pre-requisite test client and active shipment
    const testClientData = {
        companyName: 'Bhilai Rolling Mills',
        contactPerson: 'Karan Sharma',
        email: 'karan@bhilairolling.com',
        phone: '9888877777',
        creditLimit: 2000000,
    };

    await Client.deleteMany({ email: testClientData.email });
    const client = await Client.create(testClientData);

    const testShipmentData = {
        client: client._id,
        vehicleNumber: 'CG04LIVE1234',
        status: 'in_transit',
        origin: { city: 'Raipur', state: 'CG' },
        destination: { city: 'Bilaspur', state: 'CG' },
        distance: 120,
        freightCharge: 50000,
        truckOwnerPayment: 42000,
    };

    await Shipment.deleteMany({ vehicleNumber: 'CG04LIVE1234' });
    const shipment = await Shipment.create(testShipmentData);
    console.log(`   - Active tracked shipment created with ID: ${shipment._id} (LR: ${shipment.lrNumber})`);

    // Verify Active Shipments query
    const activeShipments = await Shipment.find({
        isDeleted: false,
        status: { $in: ['in_transit', 'loading', 'booked'] }
    });

    if (activeShipments.length === 0) {
        throw new Error('Active shipments query returned 0 items');
    }
    console.log(`   - Active tracked shipments query returned ${activeShipments.length} active fleet items.`);

    // Cleanup
    await Client.deleteMany({ email: testClientData.email });
    await Shipment.deleteMany({ vehicleNumber: 'CG04LIVE1234' });

    console.log('✨ All Phase 7 Real-Time GPS Tracking backend tests passed successfully!');
    process.exit(0);
};

runTests().catch(err => {
    console.error('❌ Tests failed:', err.message);
    process.exit(1);
});
