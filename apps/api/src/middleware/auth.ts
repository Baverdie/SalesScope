import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '@/config/prisma';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      email: string;
    };
    organizationId?: string;
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
    
    const payload = request.user as { sub: string; email: string };
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true },
    });

    if (!user) {
      return reply.code(401).send({ error: 'User not found' });
    }

    request.user = {
      id: user.id,
      email: user.email,
    };
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
  const membership = await prisma.membership.findFirst({
    where: {
      userId: request.user.id,
      orgId,
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
