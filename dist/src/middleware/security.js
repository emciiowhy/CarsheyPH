// backend/src/middleware/security.ts
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import hpp from 'hpp';
// --------------------------------------------------
// SECURITY HEADERS (Helmet) — FIXED CSP
// --------------------------------------------------
export const securityHeaders = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "blob:", "http:", "https:"],
            connectSrc: ["'self'", "http://localhost:5000"],
            mediaSrc: ["'self'", "data:", "blob:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
});
// --------------------------------------------------
// CORS OPTIONS
// --------------------------------------------------
export const corsOptions = {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
};
// --------------------------------------------------
// RATE LIMITER
// --------------------------------------------------
export const rateLimiter = (max, windowMs) => rateLimit({
    windowMs,
    max,
    message: 'Too many requests, please try again later.',
});
// --------------------------------------------------
// SANITIZE INPUT (XSS + HPP)
// --------------------------------------------------
export const sanitizeInput = [xss(), hpp()];
// --------------------------------------------------
// VALIDATE REQUIRED BODY FIELDS
// --------------------------------------------------
export const validateRequired = (fields) => (req, res, next) => {
    const missing = fields.filter((field) => !req.body[field]);
    if (missing.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Missing required fields: ${missing.join(', ')}`,
        });
    }
    next();
};
// --------------------------------------------------
// GLOBAL ERROR HANDLER
// --------------------------------------------------
export const errorHandler = (err, req, res, next) => {
    console.error('❌ ERROR:', err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
    });
};
//# sourceMappingURL=security.js.map