/**
 * controllers/dashboardController.js
 *
 * All dashboard data aggregation — this is where MongoDB's aggregation pipeline shines.
 * Instead of fetching all shipments and computing in JS, we push computation to the DB.
 *
 * WHY AGGREGATION PIPELINES?
 * For "sum revenue this month", a naive approach fetches ALL shipments then reduces in JS.
 * An aggregation pipeline does the math inside MongoDB — far more efficient at scale.
 *
 * AGGREGATION STAGES USED:
 * $match  — filter documents (like WHERE in SQL)
 * $group  — group and compute (like GROUP BY + SUM/COUNT in SQL)
 * $sort   — order results
 * $limit  — cap results
 * $lookup — join with another collection (like JOIN in SQL)
 * $project — reshape output documents (like SELECT in SQL)
 */

const Shipment = require('../models/Shipment');
const Client = require('../models/Client');

// ─── HELPER: Date range for today ─────────────────────────────────────────────
const getTodayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// ─── HELPER: Date range for last N days ───────────────────────────────────────
const getLastNDays = (n) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - n);
    start.setHours(0, 0, 0, 0);
    return { start, end };
};

// ─── HELPER: Date range for last N months ─────────────────────────────────────
const getLastNMonths = (n) => {
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - n);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
};

/**
 * GET /api/dashboard/kpis
 * Returns: today's revenue, profit, active shipments count, pending payments total
 */
exports.getKPIs = async (req, res, next) => {
    try {
        const { start: todayStart, end: todayEnd } = getTodayRange();

        // Run all 4 aggregations in parallel — Promise.all is critical for performance
        const [todayStats, activeCount, pendingPayments, monthStats] = await Promise.all([

            // 1. Today's revenue + profit (from shipments booked today, any status except cancelled)
            Shipment.aggregate([
                {
                    $match: {
                        bookingDate: { $gte: todayStart, $lte: todayEnd },
                        status: { $ne: 'cancelled' },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: '$freightCharge' },
                        totalProfit: { $sum: '$profit' },
                        count: { $sum: 1 },
                    },
                },
            ]),

            // 2. Active shipments (in_transit, loading)
            Shipment.countDocuments({
                status: { $in: ['in_transit', 'loading'] },
            }),

            // 3. Pending payments — sum of (freightCharge - amountPaid) for unpaid invoices
            Shipment.aggregate([
                {
                    $match: {
                        paymentStatus: { $in: ['pending', 'partial'] },
                        status: { $ne: 'cancelled' },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalPending: {
                            $sum: { $subtract: ['$freightCharge', '$amountPaid'] },
                        },
                        count: { $sum: 1 },
                    },
                },
            ]),

            // 4. This month's cumulative revenue + profit (for comparison)
            Shipment.aggregate([
                {
                    $match: {
                        bookingDate: {
                            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                            $lte: todayEnd,
                        },
                        status: { $ne: 'cancelled' },
                    },
                },
                {
                    $group: {
                        _id: null,
                        monthRevenue: { $sum: '$freightCharge' },
                        monthProfit: { $sum: '$profit' },
                        monthCount: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const today = todayStats[0] || { totalRevenue: 0, totalProfit: 0, count: 0 };
        const pending = pendingPayments[0] || { totalPending: 0, count: 0 };
        const month = monthStats[0] || { monthRevenue: 0, monthProfit: 0, monthCount: 0 };

        res.json({
            success: true,
            data: {
                today: {
                    revenue: today.totalRevenue,
                    profit: today.totalProfit,
                    shipments: today.count,
                },
                active: {
                    shipments: activeCount,
                },
                pending: {
                    amount: pending.totalPending,
                    invoices: pending.count,
                },
                month: {
                    revenue: month.monthRevenue,
                    profit: month.monthProfit,
                    shipments: month.monthCount,
                },
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/revenue-chart
 * Returns: daily revenue + profit for the last 30 days (for line chart)
 */
exports.getRevenueChart = async (req, res, next) => {
    try {
        const { start, end } = getLastNDays(29); // 30 days including today

        const data = await Shipment.aggregate([
            {
                $match: {
                    bookingDate: { $gte: start, $lte: end },
                    status: { $ne: 'cancelled' },
                },
            },
            {
                // Group by calendar day
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$bookingDate',
                            timezone: '+05:30', // IST
                        },
                    },
                    revenue: { $sum: '$freightCharge' },
                    profit: { $sum: '$profit' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: '$_id',
                    revenue: 1,
                    profit: 1,
                    count: 1,
                },
            },
        ]);

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/monthly-revenue
 * Returns: last 6 months revenue + profit (for bar chart)
 */
exports.getMonthlyRevenue = async (req, res, next) => {
    try {
        const { start } = getLastNMonths(6);

        const data = await Shipment.aggregate([
            {
                $match: {
                    bookingDate: { $gte: start },
                    status: { $ne: 'cancelled' },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m',
                            date: '$bookingDate',
                            timezone: '+05:30',
                        },
                    },
                    revenue: { $sum: '$freightCharge' },
                    profit: { $sum: '$profit' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    month: '$_id',
                    revenue: 1,
                    profit: 1,
                    count: 1,
                },
            },
        ]);

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/status-breakdown
 * Returns: shipment count per status (for donut chart)
 */
exports.getStatusBreakdown = async (req, res, next) => {
    try {
        const data = await Shipment.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1,
                },
            },
        ]);

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/recent-shipments
 * Returns: last 10 shipments with client name, route, status
 */
exports.getRecentShipments = async (req, res, next) => {
    try {
        const shipments = await Shipment.find()
            .sort({ bookingDate: -1 })
            .limit(10)
            .populate('client', 'companyName')
            .select('lrNumber origin destination status freightCharge profit bookingDate vehicleNumber client');

        res.json({ success: true, data: shipments });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/top-clients
 * Returns: top 5 clients by revenue this month
 */
exports.getTopClients = async (req, res, next) => {
    try {
        const { start } = getLastNMonths(1);

        const data = await Shipment.aggregate([
            {
                $match: {
                    bookingDate: { $gte: start },
                    status: { $ne: 'cancelled' },
                },
            },
            {
                $group: {
                    _id: '$client',
                    revenue: { $sum: '$freightCharge' },
                    profit: { $sum: '$profit' },
                    count: { $sum: 1 },
                },
            },
            { $sort: { revenue: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'clients',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'clientInfo',
                },
            },
            {
                $project: {
                    _id: 0,
                    clientId: '$_id',
                    companyName: { $arrayElemAt: ['$clientInfo.companyName', 0] },
                    revenue: 1,
                    profit: 1,
                    shipments: '$count',
                },
            },
        ]);

        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/activity-feed
 * Returns: last 15 shipment events (bookings, deliveries, payments) for timeline view
 */
exports.getActivityFeed = async (req, res, next) => {
    try {
        const shipments = await Shipment.find({ status: { $ne: 'cancelled' } })
            .sort({ updatedAt: -1 })
            .limit(15)
            .populate('client', 'companyName')
            .select('lrNumber origin destination status freightCharge bookingDate actualDeliveryDate paymentStatus client updatedAt');

        // Transform into activity events
        const activities = shipments.map((s) => {
            let action, description;
            switch (s.status) {
                case 'paid':
                    action = 'payment_received';
                    description = `Payment received for ${s.lrNumber} — ₹${s.freightCharge?.toLocaleString('en-IN')}`;
                    break;
                case 'delivered':
                case 'pod_received':
                    action = 'delivered';
                    description = `${s.lrNumber} delivered to ${s.destination?.city || 'destination'}`;
                    break;
                case 'in_transit':
                    action = 'in_transit';
                    description = `${s.lrNumber} in transit: ${s.origin?.city} → ${s.destination?.city}`;
                    break;
                case 'invoiced':
                    action = 'invoiced';
                    description = `Invoice raised for ${s.lrNumber} — ₹${s.freightCharge?.toLocaleString('en-IN')}`;
                    break;
                default:
                    action = 'booked';
                    description = `New shipment ${s.lrNumber} booked: ${s.origin?.city} → ${s.destination?.city}`;
            }

            return {
                id: s._id,
                action,
                description,
                client: s.client?.companyName || 'Unknown',
                lrNumber: s.lrNumber,
                timestamp: s.updatedAt,
            };
        });

        res.json({ success: true, data: activities });
    } catch (error) {
        next(error);
    }
};

/**
 * GET /api/dashboard/delayed-shipments
 * Returns: in-transit shipments that have crossed their expectedDeliveryDate
 */
exports.getDelayedShipments = async (req, res, next) => {
    try {
        const now = new Date();

        const delayed = await Shipment.find({
            status: { $in: ['in_transit', 'loading'] },
            expectedDeliveryDate: { $lt: now },
        })
            .sort({ expectedDeliveryDate: 1 })
            .limit(10)
            .populate('client', 'companyName')
            .select('lrNumber origin destination expectedDeliveryDate vehicleNumber driverName driverPhone client freightCharge');

        // Add delay duration
        const data = delayed.map((s) => ({
            ...s.toJSON(),
            delayDays: Math.ceil((now - new Date(s.expectedDeliveryDate)) / (1000 * 60 * 60 * 24)),
        }));

        res.json({ success: true, data, count: data.length });
    } catch (error) {
        next(error);
    }
};
