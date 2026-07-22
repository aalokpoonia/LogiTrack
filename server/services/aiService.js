/**
 * services/aiService.js
 *
 * Google Gemini Integration for LogiTrack AI Logistics Assistant.
 * Includes a robust fallback mechanism for smooth operation even if GEMINI_API_KEY is not yet populated.
 */

const { GoogleGenAI } = require('@google/generative-ai');

const isKeyConfigured = () => {
    const key = process.env.GEMINI_API_KEY;
    return key && key !== 'your_gemini_api_key_here' && key.trim() !== '';
};

// Simple rule-based intelligent agent response for fallback
const getRuleBasedAnswer = (prompt, context) => {
    const cleanPrompt = prompt.toLowerCase();
    
    // Parse context
    const { summary, activeFleet, delayedCount } = context;

    if (cleanPrompt.includes('delay') || cleanPrompt.includes('status')) {
        return `### 🚨 Current Fleet Delay Insights
We currently have **${delayedCount || 0} active delayed shipments** in our tracking system.
- **Action Recommended**: Check the [Live Tracking](/tracking) map panel to contact drivers on delay corridors.`;
    }

    if (cleanPrompt.includes('revenue') || cleanPrompt.includes('payout') || cleanPrompt.includes('financial') || cleanPrompt.includes('margin') || cleanPrompt.includes('profit')) {
        const marginPercent = summary.totalRevenue > 0
            ? Math.round((summary.totalProfit / summary.totalRevenue) * 100)
            : 0;

        return `### 📊 Financial Operations Summary
- **Aggregate Revenue**: ₹${summary.totalRevenue?.toLocaleString('en-IN') || 0}
- **Supplier/Vendor Payouts**: ₹${summary.totalPayout?.toLocaleString('en-IN') || 0}
- **Net Operating Profit**: **₹${summary.totalProfit?.toLocaleString('en-IN') || 0}**
- **Average Profit Margin**: **${marginPercent}%** (Standard industry targets: 10-18%)
- **GST Liability**: ₹${summary.totalGst?.toLocaleString('en-IN') || 0}`;
    }

    if (cleanPrompt.includes('summarize') || cleanPrompt.includes('summary') || cleanPrompt.includes('business')) {
        return `### 🚛 LogiTrack Business Operation Briefing
*   **Total LRs Booked**: ${summary.totalShipments || 0} orders
*   **Net Profits Earned**: ₹${summary.totalProfit?.toLocaleString('en-IN') || 0}
*   **Active Shipments**: ${activeFleet?.length || 0} trucks in transit/loading
*   **Outstanding Fleet Alerts**: ${delayedCount || 0} delay flags

*Note: Configure a valid \`GEMINI_API_KEY\` in your server \`.env\` file to unlock natural language conversational queries!*`;
    }

    return `### 🤖 LogiTrack AI Assistant
I received your request: "${prompt}".

To get detailed AI answers, please configure a valid \`GEMINI_API_KEY\` in your server \`.env\` file. In the meantime, you can ask about:
*   "Summarize today's business status"
*   "Show delayed shipments list"
*   "What are our total financial profits?"`;
};

exports.generateLogisticsAnswer = async (userPrompt, contextData) => {
    if (!isKeyConfigured()) {
        console.log('⚠️ GEMINI_API_KEY not configured. Falling back to local rule-based intelligence.');
        return getRuleBasedAnswer(userPrompt, contextData);
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        // Use gemini-1.5-flash for super fast responses
        const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemPrompt = `
You are the LogiTrack AI Logistics Assistant, an expert dispatcher and operations manager for a freight brokerage firm.
You have access to real-time telemetry, operations summary, and financial records of the business.

Here is the current real-time database context:
- TOTAL REVENUE: ₹${contextData.summary.totalRevenue}
- TOTAL PAYOUT TO TRUCK OWNERS: ₹${contextData.summary.totalPayout}
- NET PROFIT MARGIN: ₹${contextData.summary.totalProfit}
- TOTAL SHIPMENTS BOOKED: ${contextData.summary.totalShipments}
- ACTIVE FLEET COUNT: ${contextData.activeFleet?.length || 0}
- DELAYED SHIPMENT COUNT: ${contextData.delayedCount || 0}

Active Fleet Details:
${JSON.stringify(contextData.activeFleet || [])}

Answer the user's natural language question: "${userPrompt}"
Provide a professional, concise, actionable response formatted in beautiful Markdown (using bullet points, tables, bold text, and alert formatting if needed). Highlight operational insights.
Keep answers under 300 words.
`;

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
        });

        return result.response.text;
    } catch (error) {
        console.error('Google Gemini API Error:', error);
        return `⚠️ **Gemini AI Connection Error**: Could not complete query. Falling back to rule-based insight: \n\n${getRuleBasedAnswer(userPrompt, contextData)}`;
    }
};
