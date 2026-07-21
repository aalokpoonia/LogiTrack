/**
 * utils/logger.js
 *
 * HTTP request logger using Morgan middleware.
 *
 * WHY: In production, we use 'combined' format (Apache standard — includes IP, user-agent)
 * for log aggregation tools like Datadog, Papertrail etc.
 * In development, 'dev' format is colorful and concise.
 *
 * This is a tiny utility but it demonstrates environment-aware configuration — a concept
 * that interviewers love asking about.
 */

const morgan = require('morgan');

const logger = morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev');

module.exports = logger;
