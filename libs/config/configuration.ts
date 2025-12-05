import { readFileSync } from 'fs';

export default () => ({
  port: getPortConfig(),
  database: getDatabaseConfig(),
  app: getAppConfig(),
  logging: getLoggingConfig(),
  jwt: getJwtConfig(),
});

function getPortConfig() {
  return {
    reviews_service: Number(process.env.PORT) || 3000,
  };
}

function getDatabaseConfig() {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'reviews_db',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    autoLoadEntities: true,
    logging: process.env.DB_LOGGING === 'true',
    timezone: process.env.DB_TIMEZONE || 'UTC',
    sslConfig: process.env.DB_SSL === 'true' ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false',
    } : false,
  };
}

function getAppConfig() {
  return {
    name: process.env.APP_NAME || 'app',
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || '*',
    maxCommentsLimit: Number(process.env.MAX_COMMENTS_LIMIT) || 100,
    defaultCommentsLimit: Number(process.env.DEFAULT_COMMENTS_LIMIT) || 10,
  };
}

function getLoggingConfig() {
  const ignoreEndpoints = process.env.LOGGING_IGNORE_ENDPOINTS
    ? process.env.LOGGING_IGNORE_ENDPOINTS.split(',').map(e => e.trim())
    : ['/health', '/favicon.ico'];

  return {
    enabled: process.env.LOGGING_ENABLED !== 'false',
    logToDatabase: process.env.LOGGING_LOG_TO_DATABASE === 'true',
    ignoreEndpoints,
    logRequestBody: process.env.LOGGING_LOG_REQUEST_BODY === 'true',
    logResponseBody: process.env.LOGGING_LOG_RESPONSE_BODY === 'true',
    logHeaders: process.env.LOGGING_LOG_HEADERS === 'true',
  };
}

function getJwtConfig() {
  return {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  };
}
