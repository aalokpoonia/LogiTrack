/**
 * controllers/reportController.js
 *
 * Reports & Business Analytics Controllers for LogiTrack.
 * MongoDB Aggregations for revenue trends, top clients, route corridors, and CSV exports.
 */

const Shipment = require('../models/Shipment');

// @desc    Get aggregated business analytics
// @route   GET /api/reports/analytics
// @access  Private
exports.getAnalytics = async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        const matchStage = { isDeleted: false };

        if (startDate || endDate) {
            matchStage.bookingDate = {};
            if (startDate) matchStage.bookingDate.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                matchStage.bookingDate.$lte = end;
            }
        }

        // 1. Overall Financial Summary
        const summaryAggregation = await Shipment.aggregate([
            { $match: matchStage },
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

        // 2. Monthly Trend (Last 6 months)
        const monthlyTrend = await Shipment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$bookingDate' },
                        month: { $month: '$bookingDate' },
                    },
                    revenue: { $sum: '$freightCharge' },
                    profit: { $sum: '$profit' },
                    shipments: { $sum: 1 },
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
        ]);

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedTrend = monthlyTrend.map(item => ({
            month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            revenue: item.revenue,
            profit: item.profit,
            shipments: item.shipments,
        }));

        // 3. Top Clients by Revenue
        const topClients = await Shipment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$client',
                    revenue: { $sum: '$freightCharge' },
                    shipmentsCount: { $sum: 1 },
                    totalProfit: { $sum: '$profit' },
                }
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'clients',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'clientInfo',
                }
            },
            { $unwind: '$clientInfo' },
            {
                $project: {
                    _id: 1,
                    companyName: '$clientInfo.companyName',
                    revenue: 1,
                    shipmentsCount: 1,
                    totalProfit: 1,
                }
            }
        ]);

        // 4. Top Route Corridors
        const topRoutes = await Shipment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        origin: '$origin.city',
                        destination: '$destination.city',
                    },
                    count: { $sum: 1 },
                    totalRevenue: { $sum: '$freightCharge' },
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    route: { $concat: ['$_id.origin', ' → ', '$_id.destination'] },
                    count: 1,
                    revenue: '$totalRevenue',
                }
            }
        ]);

        // 5. Payment Status Distribution
        const paymentDistribution = await Shipment.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: '$paymentStatus',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$totalAmount' },
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                summary,
                monthlyTrend: formattedTrend,
                topClients,
                topRoutes,
                paymentDistribution,
            }
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Export filtered shipments report as CSV
// @route   GET /api/reports/export
// @access  Private
exports.exportShipmentsCSV = async (req, res, next) => {
    try {
        const { startDate, endDate, status, client } = req.query;
        const query = { isDeleted: false };

        if (status) query.status = status;
        if (client) query.client = client;

        if (startDate || endDate) {
            query.bookingDate = {};
            if (startDate) query.bookingDate.$gte = new Date(startDate);
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.bookingDate.$lte = end;
            }
        }

        const shipments = await Shipment.find(query)
            .populate('client', 'companyName contactPerson phone')
            .sort({ bookingDate: -1 });

        // Build CSV string
        let csv = 'LR Number,Booking Date,Client Name,Origin,Destination,Vehicle Number,Driver,Freight (INR),Payout (INR),GST (INR),Total Invoice (INR),Profit (INR),Status,Payment Status\n';

        shipments.forEach((s) => {
            const dateStr = new Date(s.bookingDate).toISOString().split('T')[0];
            const clientName = `"${(s.client?.companyName || 'N/A').replace(/"/g, '""')}"`;
            const origin = `"${(s.origin?.city || '').replace(/"/g, '""')}"`;
            const dest = `"${(s.destination?.city || '').replace(/"/g, '""')}"`;
            const goods = `"${(s.goodsDescription || '').replace(/"/g, '""')}"`;
            const driver = `"${(s.driverName || '').replace(/"/g, '""')}"`;

            csv += `${s.lrNumber},${dateStr},${clientName},${origin},${dest},${s.vehicleNumber || ''},${driver},${s.freightCharge || 0},${s.truckOwnerPayment || 0},${s.gstAmount || 0},${s.totalAmount || 0},${s.profit || 0},${s.status},${s.paymentStatus}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="LogiTrack-Shipments-Report-${Date.now()}.csv"`);
        res.status(200).send(csv);
    } catch (error) {
        next(error);
    }
};
