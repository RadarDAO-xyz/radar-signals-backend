import type { APIUser } from 'discord-api-types/v10';
import type { NextFunction, Request, Response } from 'express';
import { isUserARadar as isInServer, getUserInfo } from '../utils/discord';
import Airtable from 'airtable';
import { AirtableTagColumn } from '../constants';

declare global {
    namespace Express {
        interface Request {
            user: APIUser;
        }
    }
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
    process.env.AIRTABLE_MEMBER_BASE_ID || ''
);
const table = base('Table 1');

export function auth() {
    if (process.flags.noAuth)
        console.warn('APP IS IN NO AUTH MODE, THIS IS FOR TESTING PURPOSES ONLY AS IT IS INSECURE');

    return async function auth(req: Request, res: Response, next: NextFunction) {
        if (!process.flags.noAuth) {
            const auth = req.headers.authorization;
            if (!auth) return res.sendStatus(401);
            const token = auth.split(' ')[1];
            if (await isInServer(token)) {
                req.user = await getUserInfo(token);
                const result = await table
                    .select({
                        filterByFormula: `AND({${AirtableTagColumn}} = "${req.user.username}#${req.user.discriminator}", {Approved} = TRUE())`
                    })
                    .firstPage();

                if (result.length === 0) res.sendStatus(403).send('You have not been approved');
                else next();
            } else {
                res.sendStatus(403).send('You are not in the Discord server');
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
