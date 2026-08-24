import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { config } from '../config/app.config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

export const verifyAuth = async (request: FastifyRequest, reply: FastifyReply) => {
  const authHeader = request.headers.authorization;
  // Also support ?token= query param for direct browser download links (PDF, CSV, etc.)
  const queryToken = (request.query as any)?.token;
  const rawToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (queryToken || null);

  if (!rawToken) {
    return reply.status(401).send({
      success: false,
      message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
    });
  }

  try {
    const decoded = jwt.verify(rawToken, config.jwtSecret) as JwtPayload;
    request.user = decoded;
  } catch (err: any) {
    return reply.status(401).send({
      success: false,
      message: 'Token otentikasi tidak valid atau telah kadaluarsa.'
    });
  }
};

export const optionalAuth = async (request: FastifyRequest, _reply: FastifyReply) => {
  const authHeader = request.headers.authorization;
  const queryToken = (request.query as any)?.token;
  const rawToken = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : (queryToken || null);

  if (!rawToken) return;

  try {
    const decoded = jwt.verify(rawToken, config.jwtSecret) as JwtPayload;
    request.user = decoded;
  } catch {}
};

export const requireRole = (allowedRoles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ success: false, message: 'Harap login terlebih dahulu.' });
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        success: false,
        message: `Anda tidak memiliki hak akses untuk tindakan ini.`
      });
    }
  };
};

export const verifyAdmin = async (request: FastifyRequest, reply: FastifyReply) => {
  await verifyAuth(request, reply);
  if (reply.sent) return;

  const role = (request.user?.role || '').toUpperCase();
  if (role !== 'ADMIN' && role !== 'OWNER') {
    return reply.status(403).send({
      success: false,
      message: 'Akses ditolak. Fitur Easy-Tunnel hanya dapat diakses oleh Owner / Administrator.'
    });
  }
};

