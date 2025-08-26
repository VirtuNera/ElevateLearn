import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },

  // Database configuration
  database: {
    url: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true',
    maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10),
    idleTimeoutMillis: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000', 10),
  },

  // Authentication configuration
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  },

  // AI service configuration
  ai: {
    googleApiKey: process.env.GOOGLE_API_KEY,
    googleApiUrl: process.env.GOOGLE_API_URL || 'https://generativelanguage.googleapis.com/v1',
    ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
    defaultModel: process.env.AI_DEFAULT_MODEL || 'gemini-1.5-flash',
    maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000', 10),
    temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  },

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    skipSuccessfulRequests: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
    skipFailedRequests: process.env.RATE_LIMIT_SKIP_FAILED === 'true',
  },

  // File upload configuration
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // Email configuration (for future use)
  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Redis configuration (for future use)
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'combined',
    enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
    enableFile: process.env.LOG_ENABLE_FILE === 'true',
    logFile: process.env.LOG_FILE || './logs/app.log',
  },

  // Security configuration
  security: {
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    enableCors: process.env.ENABLE_CORS !== 'false',
    enableHelmet: process.env.ENABLE_HELMET !== 'false',
    enableRateLimit: process.env.ENABLE_RATE_LIMIT !== 'false',
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
  },

  // Feature flags
  features: {
    enableAI: process.env.ENABLE_AI !== 'false',
    enableQuizzes: process.env.ENABLE_QUIZZES !== 'false',
    enableTags: process.env.ENABLE_TAGS !== 'false',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableStudyPlans: process.env.ENABLE_STUDY_PLANS !== 'false',
    enableOrganizations: process.env.ENABLE_ORGANIZATIONS !== 'false',
  },

  // Organization settings
  organization: {
    defaultType: process.env.DEFAULT_ORG_TYPE || 'university',
    maxUsers: parseInt(process.env.MAX_ORG_USERS || '1000', 10),
    maxCourses: parseInt(process.env.MAX_ORG_COURSES || '100', 10),
  },

  // Quiz settings
  quiz: {
    defaultTimeLimit: parseInt(process.env.DEFAULT_QUIZ_TIME_LIMIT || '30', 10), // minutes
    defaultPassingScore: parseInt(process.env.DEFAULT_QUIZ_PASSING_SCORE || '70', 10),
    maxAttempts: parseInt(process.env.MAX_QUIZ_ATTEMPTS || '3', 10),
    enableRandomization: process.env.ENABLE_QUIZ_RANDOMIZATION !== 'false',
  },

  // Analytics settings
  analytics: {
    dataRetentionDays: parseInt(process.env.ANALYTICS_RETENTION_DAYS || '365', 10),
    enableRealTime: process.env.ENABLE_REALTIME_ANALYTICS === 'true',
    batchSize: parseInt(process.env.ANALYTICS_BATCH_SIZE || '1000', 10),
  },

  // Tag engine settings
  tags: {
    maxTagsPerCourse: parseInt(process.env.MAX_TAGS_PER_COURSE || '10', 10),
    minConfidence: parseFloat(process.env.MIN_TAG_CONFIDENCE || '0.6'),
    enableAITagging: process.env.ENABLE_AI_TAGGING !== 'false',
    predefinedTags: process.env.PREDEFINED_TAGS?.split(',') || [],
  },

  // Study plan settings
  studyPlans: {
    maxPlansPerUser: parseInt(process.env.MAX_STUDY_PLANS_PER_USER || '5', 10),
    defaultTimeAvailable: parseInt(process.env.DEFAULT_STUDY_TIME || '10', 10), // hours per week
    enableAIGeneration: process.env.ENABLE_AI_STUDY_PLANS !== 'false',
  },
};

// Validation function to check required configuration
export function validateConfig() {
  const required = [
    'DATABASE_URL',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate AI configuration if enabled
  if (config.features.enableAI && !config.ai.googleApiKey) {
    console.warn('AI features are enabled but GOOGLE_API_KEY is not set. AI features will use fallback responses.');
  }

  // Validate file upload configuration
  if (config.upload.maxFileSize > 100 * 1024 * 1024) { // 100MB
    throw new Error('MAX_FILE_SIZE cannot exceed 100MB');
  }

  return true;
}

// Get configuration for a specific environment
export function getConfig(env: string = process.env.NODE_ENV || 'development') {
  const envConfig = {
    development: {
      ...config,
      logging: {
        ...config.logging,
        level: 'debug',
        enableConsole: true,
      },
      security: {
        ...config.security,
        corsOrigin: ['http://localhost:3000', 'http://localhost:5000'],
      },
    },
    production: {
      ...config,
      logging: {
        ...config.logging,
        level: 'warn',
        enableConsole: false,
        enableFile: true,
      },
      security: {
        ...config.security,
        enableCors: true,
        enableHelmet: true,
        enableRateLimit: true,
        enableCompression: true,
      },
    },
    test: {
      ...config,
      database: {
        ...config.database,
        url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test',
      },
      logging: {
        ...config.logging,
        level: 'error',
        enableConsole: false,
        enableFile: false,
      },
    },
  };

  return envConfig[env as keyof typeof envConfig] || envConfig.development;
}

export default config;
