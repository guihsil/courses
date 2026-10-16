import { Request, Response, NextFunction } from "express";
import jwt from 'jsonwebtoken';

export function verifyAuthenticated(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ msg: 'JWT token é obrigatório' });
    }

    const [scheme, token, ...extra] = authHeader.trim().split(/\s+/);

    if (scheme?.toLowerCase() !== 'bearer' || !token || extra.length > 0) {
        return res.status(401).json({ msg: 'Formato esperado: Bearer <token>.' });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return next(new Error('JWT_SECRET não configurado'));
    }

    try {
        const payload = jwt.verify(token, secret);

        if (typeof payload === 'string' || typeof payload.sub !== 'string') {
            return res.status(401).json({ msg: 'Token inválido.' });
        }

        req.auth = { userId: payload.sub };
        return next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ msg: 'Token inválido / expirado' });
        }
    }

    return next();
}

// jwt.sign({}, secret, { subject: user.id, expiresIn: '1h' });