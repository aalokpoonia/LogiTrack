/**
 * scripts/testAI.js
 *
 * Automated verification script for Phase 9 (AI Assistant).
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Client = require('../models/Client');
const Shipment = require('../models/Shipment');
const { generateLogisticsAnswer } = require('../services/aiService');

dotenv.config();

const runTests = async () => {
    console.log('🧪 Starting Phase 9 AI Assistant backend tests...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB.');

    // Pre-requisite context structures
    const context = {
        summary: {
            totalRevenue: 350000,
            totalPayout: 290000,
            totalProfit: 60000,
            totalGst: 17500,
            totalShipments: 8,
        },
        activeFleet: [
            {
                lrNumber: 'LR-2026-112233',
                status: 'in_transit',
                origin: { city: 'Raipur' },
                destination: { city: 'Bilaspur' },
                vehicleNumber: 'CG04AB1234',
                driverName: 'Ramesh Patel',
            }
        ],
        delayedCount: 1,
    };

    console.log('➡️ Querying AI Service with simulated prompt...');
    const prompt = "Summarize today's business status, active shipments and operating margins.";
    
    const answer = await generateLogisticsAnswer(prompt, context);
    
    if (!answer || answer.trim() === '') {
        throw new Error('AI Service returned an empty or invalid answer');
    }
    
    console.log('✅ AI Service response received:\n');
    console.log(answer);
    console.log('\n✨ All Phase 9 AI Assistant backend tests passed successfully!');
    process.exit(0);
};

runTests().catch(err => {
    console.error('❌ Tests failed:', err.message);
    process.exit(1);
});
