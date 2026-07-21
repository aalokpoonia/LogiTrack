/**
 * config/db.js
 *
 * MongoDB connection module.
 * Extracted from server.js to follow Single Responsibility Principle.
 * server.js should only bootstrap the app — DB connection lives here.
 *
 * WHY: If we ever need to add connection pooling, replica set options,
 * or retry logic, this is the single file to update.
 */

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            // These options prevent deprecation warnings in Mongoose 8+
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Exit process with failure — no point running the app without DB
        process.exit(1);
    }
};

module.exports = connectDB;
