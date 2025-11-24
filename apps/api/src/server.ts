import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyCompress from '@fastify/compress';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import { config, isDevelopment } from './utils/config.js';
import { prisma } from './utils/db.js';
import { redis } from './utils/redis.js';
import { authenticate } from './middleware/auth.middleware.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { datasetRoutes } from './modules/datasets/dataset.routes.js';
import { analyticsRoutes } from './modules/analytics/analytics.routes.js';

// Declare custom properties
declare module 'fastify' {
  interface FastifyInstance {
    config: typeof config;
    authenticate: typeof authenticate;
  }
}

const fastify = Fastify({
  logger: isDevelopment
    ? {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
      level: 'debug',
    }
    : {
      level: 'info',
    },
  trustProxy: true,
  disableRequestLogging: false,
  requestIdLogLabel: 'reqId',
});

// Register plugins
await fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

await fastify.register(fastifyCors, {
  origin: isDevelopment
    ? (origin, cb) => {
      // En dev, accepte tous les localhost
      if (!origin || origin.startsWith('http://localhost:')) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    }
    : config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
});

await fastify.register(fastifyCompress, {
  global: true,
  threshold: 1024, // Only compress responses > 1KB
});

await fastify.register(fastifyCookie, {
  secret: config.jwt.refreshSecret,
});

await fastify.register(fastifyRateLimit, {
  max: config.rateLimit.max,
  timeWindow: config.rateLimit.timeWindow,
  cache: 10000,
  redis: redis,
  skipOnError: true,
});

// Add config and authenticate to fastify instance
fastify.decorate('config', config);
fastify.decorate('authenticate', authenticate);

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    // Check Redis connection
    await redis.ping();

    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up',
      },
    });
  } catch (err) {
    fastify.log.error({ err }, 'Health check failed');
    return reply.code(503).send({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

// API routes
// API routes
await fastify.register(
  async (fastify) => {
    await fastify.register(authRoutes, { prefix: '/auth' });
    await fastify.register(datasetRoutes, { prefix: '/datasets' });
    await fastify.register(analyticsRoutes, { prefix: '/analytics' });
  },
  { prefix: '/api' }
);

// 404 handler
fastify.setNotFoundHandler((request, reply) => {
  reply.code(404).send({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Global error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(
    {
      err: error,
      reqId: request.id,
      method: request.method,
      url: request.url,
    },
    'Request error'
  );

  // Don't leak error details in production
  const message =
    config.app.env === 'production'
      ? 'Internal server error'
      : error instanceof Error
      ? error.message
      : 'Unknown error';

  const statusCode = typeof error === 'object' && error !== null && 'statusCode' in error ? (error as any).statusCode : 500;

  reply.code(statusCode).send({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
});

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  fastify.log.info(`Received ${signal}, closing gracefully...`);

  try {
    await fastify.close();
    await prisma.$disconnect();
    await redis.quit();
    fastify.log.info('Server closed successfully');
    process.exit(0);
  } catch (err) {
    fastify.log.error({ err }, 'Error during graceful shutdown');
    process.exit(1);
  }
};

process.on('SIGTERM', () => closeGracefully('SIGTERM'));
process.on('SIGINT', () => closeGracefully('SIGINT'));

// Start server
const start = async () => {
  try {
    const address = await fastify.listen({
      port: config.app.port,
      host: '0.0.0.0',
    });

    fastify.log.info(`Server listening on ${address}`);
    fastify.log.info(`Environment: ${config.app.env}`);
    fastify.log.info(`Health check: ${address}/health`);
  } catch (err) {
    fastify.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
};

start();