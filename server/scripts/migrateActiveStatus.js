const mongoose = require('mongoose');
require('dotenv').config();

const Client = require('../models/Client');
const Broker = require('../models/Broker');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');

const models = [
    { name: 'Client', Model: Client },
    { name: 'Broker', Model: Broker },
    { name: 'Vehicle', Model: Vehicle },
    { name: 'Driver', Model: Driver },
];

const migrateCollection = async ({ name, Model }) => {
    const query = {
        $or: [
            { isActive: { $exists: false } },
            { isActive: null },
        ],
    };

    const result = await Model.updateMany(
        query,
        { $set: { isActive: true } },
        { runValidators: false }
    );

    console.log(`${name}: matched=${result.matchedCount}, modified=${result.modifiedCount}`);
};

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for active-status migration');

        for (const modelDefinition of models) {
            await migrateCollection(modelDefinition);
        }

        await mongoose.disconnect();
        console.log('Active-status migration completed successfully');
    } catch (error) {
        console.error('Active-status migration failed:', error);
        process.exit(1);
    }
})();
