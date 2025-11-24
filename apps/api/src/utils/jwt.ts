import jwt from 'jsonwebtoken';
import { config } from './config';
import { prisma } from './db';
import type { AccessTokenPayload, RefreshTokenPayload } from '@salesscope/types';

const ACCESS_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/**
 * Generate access token (short-lived)
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret as any, {
    expiresIn: config.jwt.accessExpiresIn,
    issuer: 'salesscope-api',
    audience: 'salesscope-web',
  } as any);
};

/**
 * Generate refresh token (long-lived) and store in DB
 */
export const generateRefreshToken = async (
  userId: string
): Promise<string> => {
  const tokenId = generateTokenId();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRES_IN_MS);

  const payload: RefreshTokenPayload = {
    userId,
    tokenId,
  };

  const token = jwt.sign(payload, config.jwt.refreshSecret as any, {
    expiresIn: config.jwt.refreshExpiresIn,
    issuer: 'salesscope-api',
    audience: 'salesscope-web',
  } as any);

  // Store refresh token in database for revocation capability
  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId,
      token,
      expiresAt,
    },
  });

  return token;
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret, {
      issuer: 'salesscope-api',
      audience: 'salesscope-web',
    }) as AccessTokenPayload;
    return payload;
  } catch (err) {
    throw new Error('Invalid access token');
  }
};

/**
 * Verify refresh token and check if it's been revoked
 */
export const verifyRefreshToken = async (
  token: string
): Promise<RefreshTokenPayload> => {
  try {
    const payload = jwt.verify(token, config.jwt.refreshSecret, {
      issuer: 'salesscope-api',
      audience: 'salesscope-web',
    }) as RefreshTokenPayload;

    // Check if token exists in database and hasn't been revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { id: payload.tokenId },
    });

    if (!storedToken) {
      throw new Error('Refresh token not found');
    }

    if (storedToken.revokedAt) {
      throw new Error('Refresh token has been revoked');
    }

    if (storedToken.expiresAt < new Date()) {
      throw new Error('Refresh token has expired');
    }

    return payload;
  } catch (err) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Revoke a refresh token (for logout)
 */
export const revokeRefreshToken = async (tokenId: string): Promise<void> => {
  await prisma.refreshToken.update({
    where: { id: tokenId },
    data: { revokedAt: new Date() },
  });
};

/**
 * Revoke all refresh tokens for a user (for logout all devices)
 */
export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

/**
 * Rotate refresh token (revoke old, generate new)
 */
export const rotateRefreshToken = async (
  oldTokenId: string,
  userId: string
): Promise<string> => {
  // Revoke old token
  await revokeRefreshToken(oldTokenId);

  // Generate new token
  return generateRefreshToken(userId);
};

/**
 * Clean up expired refresh tokens (should be run periodically)
 */
export const cleanupExpiredTokens = async (): Promise<number> => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  return result.count;
};

/**
 * Generate a unique token ID
 */
function generateTokenId(): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}
