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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({
      success: false,
      message: 'Akses ditolak. Token otentikasi tidak ditemukan.'
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
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
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
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
