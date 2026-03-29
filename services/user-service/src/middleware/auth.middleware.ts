import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthRequest extends Request {
    user?: any;
}

export const authMiddleware = (req: any, res: Response, next: NextFunction) => {
    let token = req.headers.authorization?.split(' ')[1];

    // Fallback: Check cookies if header is missing
    if (!token && req.cookies) {
        token = req.cookies.accessToken;
    }

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log(`[AUTH-MID] Token Verified: ${JSON.stringify(decoded)}`);
        req.user = decoded;
        next();
    } catch (err: any) {
        console.log(`[AUTH-MID] Token Failed: ${err.message}`);
        next();
    }
};
