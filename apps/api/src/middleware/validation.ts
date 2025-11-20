import { FastifyRequest, FastifyReply } from 'fastify';
import { z, ZodSchema } from 'zod';

export function validate<T extends ZodSchema>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.body);
      request.body = validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  };
}

export function validateQuery<T extends ZodSchema>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.query);
      request.query = validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  };
}

export function validateParams<T extends ZodSchema>(schema: T) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    try {
      const validated = schema.parse(request.params);
      request.params = validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'Validation error',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        });
      }
      return reply.code(500).send({ error: 'Internal server error' });
    }
  };
}
