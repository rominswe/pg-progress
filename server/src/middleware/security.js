import helmet from 'helmet';
import hpp from 'hpp';

/* ================= HELMET SECURITY HEADERS ================= */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: "deny" }
});

/* ================= HTTPS ENFORCEMENT ================= */
export const enforceHttps = (req, res, next) => {
  // Skip HTTPS enforcement in development
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  // Check if request is already HTTPS
  if (req.header('x-forwarded-proto') !== 'https') {
    // Redirect to HTTPS
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
};

/* ================= HTTP PARAMETER POLLUTION PROTECTION ================= */
export const preventHpp = hpp({
  whitelist: [
    // Allow multiple values for these parameters
    'recipientIds',
    'fileIds',
    'userIds'
  ]
});

/* ================= REQUEST SIZE LIMITING ================= */
export const limitRequestSize = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length']);

  if (contentLength && contentLength > 10 * 1024 * 1024) { // 10MB limit
    return res.status(413).json({
      error: 'Request entity too large',
      maxSize: '10MB'
    });
  }

  next();
};

/* ================= CORS SECURITY ENHANCEMENT ================= */
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS ?
      process.env.ALLOWED_ORIGINS.split(',') :
      ["http://localhost:5173", "http://localhost:5174"];

    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Rate-Limit-Remaining'],
  maxAge: 86400 // 24 hours
};

/* ================= SECURITY EVENT LOGGING ================= */
export const logSuspiciousActivity = (req, res, next) => {
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded-host',
    'x-forwarded-proto'
  ];

  const suspiciousValues = suspiciousHeaders
    .map(header => req.headers[header])
    .filter(value => value && value.length > 100); // Unusually long header values

  if (suspiciousValues.length > 0) {
    // This could indicate header injection attempts
    console.warn('Suspicious headers detected:', {
      ip: req.ip,
      headers: suspiciousValues,
      userAgent: req.get('user-agent')
    });
  }

  // Check for unusual request patterns
  if (req.url.length > 2000) {
    console.warn('Unusually long URL detected:', {
      ip: req.ip,
      url: req.url.substring(0, 100) + '...',
      length: req.url.length
    });
  }

  next();
};

/* ================= API KEY VALIDATION (FOR FUTURE USE) ================= */
export const validateApiKey = (req, res, next) => {
  // This can be used for API key authentication in the future
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  if (apiKey) {
    // Validate API key against database or environment
    const validApiKeys = process.env.VALID_API_KEYS ?
      process.env.VALID_API_KEYS.split(',') : [];

    if (!validApiKeys.includes(apiKey)) {
      return res.status(401).json({
        error: 'Invalid API key'
      });
    }
  }

  next();
};

/* ================= REQUEST TIMEOUT ================= */
export const requestTimeout = (timeoutMs = 30000) => { // 30 seconds default
  return (req, res, next) => {
    const timeout = setTimeout(() => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process'
        });
      }
    }, timeoutMs);

    res.on('finish', () => {
      clearTimeout(timeout);
    });

    next();
  };
};