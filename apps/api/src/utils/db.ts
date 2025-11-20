import { PrismaClient } from '@prisma/client';
import { isDevelopment } from './config.js';
import { logger } from './logger.js';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: isDevelopment
      ? [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ]
      : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (isDevelopment) {
  globalThis.prismaGlobal = prisma;

  // Log queries in development
  prisma.$on('query' as never, (e: unknown) => {
    const event = e as { query: string; params: string; duration: number };
    logger.debug(
      {
        query: event.query,
        params: event.params,
        duration: `${event.duration}ms`,
      },
      'Prisma Query'
    );
  });

  prisma.$on('error' as never, (e: unknown) => {
    const event = e as { message: string };
    logger.error({ message: event.message }, 'Prisma Error');
  });

  prisma.$on('warn' as never, (e: unknown) => {
    const event = e as { message: string };
    logger.warn({ message: event.message }, 'Prisma Warning');
  });
}
