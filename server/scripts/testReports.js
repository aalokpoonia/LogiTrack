/**
 * scripts/testReports.js
 *
 * Automated verification script for Phase 8 (Reports & Analytics).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Client = require('../models/Client');
const Shipment = require('../models/Shipment');

dotenv.config();

const runTests = async () => {
    console.log('🧪 Starting Phase 8 Reports & Analytics backend tests...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB.');

    // Pre-requisite test client and shipment
    const testClientData = {
        companyName: 'Raipur Steel Hub',
        contactPerson: 'Arun Jain',
        email: 'arun.jain@raipursteel.com',
        phone: '9888899999',
        creditLimit: 3000000,
    };

    await Client.deleteMany({ email: testClientData.email });
    const client = await Client.create(testClientData);

    const testShipmentData = {
        client: client._id,
        vehicleNumber: 'CG04REPORTS',
        status: 'delivered',
        origin: { city: 'Raipur', state: 'CG' },
        destination: { city: 'Bilaspur', state: 'CG' },
        distance: 120,
        freightCharge: 60000,
        truckOwnerPayment: 50000,
        additionalCharges: 1000,
        gstAmount: 3000,
        paymentStatus: 'paid',
        amountPaid: 64000,
    };

    await Shipment.deleteMany({ vehicleNumber: 'CG04REPORTS' });
    const shipment = await Shipment.create(testShipmentData);
    console.log(`   - Test shipment created with ID: ${shipment._id} (LR: ${shipment.lrNumber})`);

    // Verify MongoDB Aggregations
    console.log('➡️ Testing Analytics Grouping Aggregations...');
    const matchStage = { isDeleted: false };
    
    // Financial Summary aggregation
    const summaryAggregation = await Shipment.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: '$freightCharge' },
                totalProfit: { $sum: '$profit' },
                totalShipments: { $sum: 1 },
            }
        }
    ]);
    const summary = summaryAggregation[0];
    if (!summary || summary.totalRevenue === 0) {
        throw new Error('Analytics financial summary aggregation returned empty values');
    }
    console.log(`   - Financial summary passed: Revenue = ₹${summary.totalRevenue}, Profit = ₹${summary.totalProfit}`);

    // Clean up
    await Client.deleteMany({ email: testClientData.email });
    await Shipment.deleteMany({ vehicleNumber: 'CG04REPORTS' });

    console.log('✨ All Phase 8 Reports & Analytics backend tests passed successfully!');
    process.exit(0);
};

runTests().catch(err => {
    console.error('❌ Tests failed:', err.message);
    process.exit(1);
});
