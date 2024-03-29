import { Router, text } from 'express';
import { verifyDiscordSignature } from '../utils/discord';
import { interaction } from './discord/interaction';

export function discord(publicKey: string) {
    const router = Router();

    router.use(text({ type: '*/*' }));

    router.use(verifyDiscordSignature(publicKey));

    router.use((req, res, next) => {
        try {
            req.body = JSON.parse(req.body);
            next();
        } catch {
            res.sendStatus(400);
        }
    });

    router.use('/interaction', interaction());

    return router;
}
