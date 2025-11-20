import type { FastifyInstance } from 'fastify';
import { AuthService } from './auth.service.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from './auth.schema.js';
import { logger } from '../../utils/logger.js';

export async function authRoutes(fastify: FastifyInstance) {
  const authService = new AuthService();

  /**
   * Register a new user
   * POST /api/auth/register
   */
  fastify.post('/register', async (request, reply) => {
    try {
      const body = registerSchema.parse(request.body);
      const tokens = await authService.register(body);

      // Set refresh token as httpOnly cookie
      reply.setCookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: fastify.config.app.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return reply.code(201).send({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (err) {
      logger.error({ err }, 'Registration error');
      return reply.code(400).send({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: err instanceof Error ? err.message : 'Registration failed',
        },
      });
    }
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  fastify.post('/login', async (request, reply) => {
    try {
      const body = loginSchema.parse(request.body);
      const tokens = await authService.login(body);

      // Set refresh token as httpOnly cookie
      reply.setCookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: fastify.config.app.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return reply.send({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (err) {
      logger.error({ err }, 'Login error');
      return reply.code(401).send({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: 'Invalid credentials',
        },
      });
    }
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  fastify.post('/refresh', async (request, reply) => {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (!refreshToken) {
        return reply.code(401).send({
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'Refresh token not found',
          },
        });
      }

      const tokens = await authService.refresh(refreshToken);

      // Set new refresh token as httpOnly cookie
      reply.setCookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: fastify.config.app.env === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });

      return reply.send({
        success: true,
        data: {
          accessToken: tokens.accessToken,
        },
      });
    } catch (err) {
      logger.error({ err }, 'Token refresh error');
      return reply.code(401).send({
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: 'Invalid or expired refresh token',
        },
      });
    }
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  fastify.post('/logout', async (request, reply) => {
    try {
      const refreshToken = request.cookies.refreshToken;

      if (refreshToken) {
        await authService.logout(refreshToken);
      }

      // Clear refresh token cookie
      reply.clearCookie('refreshToken', {
        path: '/',
      });

      return reply.send({
        success: true,
        data: {
          message: 'Logged out successfully',
        },
      });
    } catch (err) {
      logger.error({ err }, 'Logout error');
      return reply.code(500).send({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: 'Logout failed',
        },
      });
    }
  });

  /**
   * Get current user
   * GET /api/auth/me
   */
  fastify.get(
    '/me',
    {
      onRequest: [fastify.authenticate],
    },
    async (request, reply) => {
      try {
        const user = await authService.getCurrentUser(request.user.userId);

        return reply.send({
          success: true,
          data: user,
        });
      } catch (err) {
        logger.error({ err }, 'Get current user error');
        return reply.code(500).send({
          success: false,
          error: {
            code: 'GET_USER_FAILED',
            message: 'Failed to get user',
          },
        });
      }
    }
  );
}
