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
    if (process.flags.noAuth)
        console.warn('APP IS IN NO AUTH MODE, THIS IS FOR TESTING PURPOSES ONLY AS IT IS INSECURE');

    return async function auth(req: Request, res: Response, next: NextFunction) {
        if (!process.flags.noAuth) {
            const auth = req.headers.authorization;
            if (!auth) return res.sendStatus(401);
            const token = auth.split(' ')[1];
            if (await isUserARadar(token)) {
                req.user = await getUserInfo(token);
                next();
            } else {
                res.sendStatus(403);
            }
        } else {
            req.user = {
                username: 'MrTomato',
                discriminator: '9412',
                avatar: 'b738d5308808dfdb9fb61c0fa9bd0c41',
                id: '337266897458429956'
            };
            next();
        }
    };
}
