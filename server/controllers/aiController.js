/**
 * controllers/aiController.js
 *
 * Controller for AI Logistics Assistant queries.
 */

const Shipment = require('../models/Shipment');
const { generateLogisticsAnswer } = require('../services/aiService');

// @desc    Post query to Gemini AI Logistics Assistant
// @route   POST /api/ai/query
// @access  Private
exports.queryAssistant = async (req, res, next) => {
    try {
        const { prompt } = req.body;
        if (!prompt || prompt.trim() === '') {
            res.status(400);
            throw new Error('Prompt query is required');
        }

        // 1. Gather context data
        const summaryAggregation = await Shipment.aggregate([
            { $match: { isDeleted: false } },
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: '$freightCharge' },
                    totalPayout: { $sum: '$truckOwnerPayment' },
                    totalProfit: { $sum: '$profit' },
                    totalGst: { $sum: '$gstAmount' },
                    totalShipments: { $sum: 1 },
                }
            }
        ]);

        const summary = summaryAggregation[0] || {
            totalRevenue: 0,
            totalPayout: 0,
            totalProfit: 0,
            totalGst: 0,
            totalShipments: 0,
        };

        const activeFleet = await Shipment.find({
            isDeleted: false,
            status: { $in: ['in_transit', 'loading', 'booked'] }
        })
            .populate('client', 'companyName')
            .select('lrNumber status origin destination vehicleNumber driverName expectedDeliveryDate distance')
            .limit(10);

        // Count simple alerts: active shipments past expected delivery date (delayed)
        const today = new Date();
        const delayedCount = await Shipment.countDocuments({
            isDeleted: false,
            status: { $in: ['in_transit', 'loading'] },
            expectedDeliveryDate: { $lt: today }
        });

        const context = {
            summary,
            activeFleet,
            delayedCount,
        };

        // 2. Generate result via service
        const answer = await generateLogisticsAnswer(prompt, context);

        res.json({
            success: true,
            answer,
        });
    } catch (error) {
        next(error);
    }
};
