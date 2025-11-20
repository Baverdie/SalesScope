import { prisma } from '../../utils/db.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from '../../utils/jwt.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';
import type { User, AuthTokens, AccessTokenPayload } from '@salesscope/types';

export class AuthService {
  /**
   * Register a new user and create their organization
   */
  async register(input: RegisterInput): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Generate unique org slug
    const orgSlug = await this.generateUniqueSlug(input.organizationName);

    // Create user and organization in a transaction
    const user = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: input.organizationName,
          slug: orgSlug,
        },
      });

      // Create user
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          name: input.name,
          passwordHash,
        },
      });

      // Create membership (user is owner of their org)
      await tx.organizationMember.create({
        data: {
          userId: newUser.id,
          organizationId: organization.id,
          role: 'OWNER',
        },
      });

      return { ...newUser, organizationId: organization.id };
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: 'OWNER' as never,
    });

    const refreshToken = await generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  /**
   * Login user
   */
  async login(input: LoginInput): Promise<AuthTokens> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        memberships: {
          include: {
            organization: true,
          },
          take: 1, // Get first organization for now
        },
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(
      input.password,
      user.passwordHash
    );

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    if (user.memberships.length === 0) {
      throw new Error('User has no organization');
    }

    const membership = user.memberships[0];

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role as never,
    });

    const refreshToken = await generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    // Get user with organization
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        memberships: {
          include: {
            organization: true,
          },
          take: 1,
        },
      },
    });

    if (!user || user.memberships.length === 0) {
      throw new Error('User not found');
    }

    const membership = user.memberships[0];

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      organizationId: membership.organizationId,
      role: membership.role as never,
    });

    // Rotate refresh token
    const newRefreshToken = await rotateRefreshToken(
      payload.tokenId,
      user.id
    );

    return { accessToken, refreshToken: newRefreshToken };
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logout(refreshToken: string): Promise<void> {
    const payload = await verifyRefreshToken(refreshToken);
    await revokeRefreshToken(payload.tokenId);
  }

  /**
   * Get current user info
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Generate unique organization slug
   */
  private async generateUniqueSlug(name: string): Promise<string> {
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await prisma.organization.findUnique({
        where: { slug },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }
}
