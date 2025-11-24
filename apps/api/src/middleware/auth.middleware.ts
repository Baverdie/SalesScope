import type { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../utils/jwt.js';
import type { AccessTokenPayload } from '@salesscope/types';
import { logger } from '../utils/logger';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload;
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = verifyAccessToken(token);

    // Attach user to request
    request.user = payload;
  } catch (err) {
    logger.error({ err }, 'Authentication failed');
    return reply.code(401).send({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired access token',
      },
    });
  }
}

/**
 * Organization access middleware
 * Ensures user has access to the requested organization
 */
export async function requireOrganizationAccess(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const params = request.params as { organizationId?: string };
  const organizationId = params.organizationId;

  if (!organizationId) {
    return reply.code(400).send({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Organization ID is required',
      },
    });
  }

  if (request.user.organizationId !== organizationId) {
    return reply.code(403).send({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'You do not have access to this organization',
      },
    });
  }
}

/**
 * Role-based access control middleware
 */
export function requireRole(...allowedRoles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!allowedRoles.includes(request.user.role)) {
      return reply.code(403).send({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }
  };
}
