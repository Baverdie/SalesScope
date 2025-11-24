import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/config/prisma';
import type { AccessTokenPayload } from '@salesscope/types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: AccessTokenPayload;
    organizationId?: string;
  }
}

// Augment FastifyRequest with jwtVerify provided by @fastify/jwt
declare module 'fastify' {
  interface FastifyRequest {
    jwtVerify?: (opts?: unknown) => Promise<void>;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();

    const payload = request.user as AccessTokenPayload;

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return reply.code(401).send({ error: 'User not found' });
    }
  } catch (error) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
}

export async function requireOrganization(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const orgId = request.params['orgId'] as string | undefined;

  if (!orgId) {
    return reply.code(400).send({ error: 'Organization ID is required' });
  }

  if (!request.user) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  // Verify user has access to this organization
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId: request.user?.userId,
      organizationId: orgId,
    },
    include: {
      organization: true,
    },
  });

  if (!membership) {
    return reply.code(403).send({ error: 'Access denied to this organization' });
  }

  request.organizationId = orgId;
}
