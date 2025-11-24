import { nanoid } from 'nanoid';
import { prisma } from '@/config/prisma';
import { env } from '@/config/env';

export interface TokenPayload {
  sub: string;
  email: string;
  type: 'access' | 'refresh';
}

export const tokenUtils = {
  /**
   * Generate a cryptographically secure refresh token
   */
  generateRefreshToken(): string {
    return nanoid(64);
  },

  /**
   * Create and store a refresh token in the database
   */
  async createRefreshToken(userId: string): Promise<string> {
    const token = this.generateRefreshToken();
    const expiresAt = new Date();

    // Parse refresh token expiration (e.g., "7d" -> 7 days)
    const expiresIn = env.JWT_REFRESH_EXPIRES_IN;
    const match = expiresIn.match(/^(\d+)([dhms])$/);

    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];

      switch (unit) {
        case 'd':
          expiresAt.setDate(expiresAt.getDate() + value);
          break;
        case 'h':
          expiresAt.setHours(expiresAt.getHours() + value);
          break;
        case 'm':
          expiresAt.setMinutes(expiresAt.getMinutes() + value);
          break;
        case 's':
          expiresAt.setSeconds(expiresAt.getSeconds() + value);
          break;
      }
    }

    await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  },

  /**
   * Verify and retrieve a refresh token
   */
  async verifyRefreshToken(token: string): Promise<{
    valid: boolean;
    userId?: string;
    error?: string;
  }> {
    const refreshToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken) {
      return { valid: false, error: 'Token not found' };
    }

    if (refreshToken.revokedAt) {
      return { valid: false, error: 'Token has been revoked' };
    }

    if (refreshToken.expiresAt < new Date()) {
      return { valid: false, error: 'Token has expired' };
    }

    return { valid: true, userId: refreshToken.userId };
  },

  /**
   * Revoke a refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
  },

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeAllUserTokens(userId: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
  },

  /**
   * Clean up expired tokens (should be run periodically)
   */
  async cleanupExpiredTokens(): Promise<number> {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  },

  /**
   * Detect potential token replay attacks
   * Returns true if suspicious activity is detected
   */
  async detectReplayAttack(
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<boolean> {
    const recentTokens = await prisma.refreshToken.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 60000), // Last minute
        },
      },
    });

    // If more than 3 tokens created in the last minute, consider it suspicious
    if (recentTokens.length > 3) {
      return true;
    }

    return false;
  },
};
