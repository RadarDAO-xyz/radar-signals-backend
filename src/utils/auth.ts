import type { APIUser } from 'discord-api-types/v10';
import type { NextFunction, Request, Response } from 'express';
import { isUserARadar, getUserInfo } from '../utils/discord';

declare global {
    namespace Express {
        interface Request {
            user: APIUser;
        }
    }
}

export function auth() {
    return async function auth(req: Request, res: Response, next: NextFunction) {
        const auth = req.headers.authorization;
        if (!auth) return res.sendStatus(401);
        const token = auth.split(' ')[1];
        if (await isUserARadar(token)) {
            req.user = await getUserInfo(token);
            next();
        } else {
            res.sendStatus(403);
        }
    };
}
