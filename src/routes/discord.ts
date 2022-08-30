import { Router, text } from 'express';
import { verifyDiscordSignature } from '../utils/discord';
import { integration } from './discord/integration';

export function discord(publicKey: string) {
    const router = Router();

    router.use(text());

    router.use(verifyDiscordSignature(publicKey));

    router.use((req, res, next) => {
        try {
            req.body = JSON.parse(req.body);
            next();
        } catch {
            res.sendStatus(400);
        }
    });

    router.use('/integration', integration());

    return router;
}
