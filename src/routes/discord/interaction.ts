import { APIChatInputApplicationCommandInteraction } from 'discord-api-types/v10';
import { Router } from 'express';
import tag from './slash/tag';
import viewtags from './slash/viewtags';

export function interaction() {
    const router = Router();

    router.post('/', (req, res) => {
        if (req.body.type === 1) res.status(200).json({ type: 1 });
        else if (req.body.type === 2) {
            const body = req.body as APIChatInputApplicationCommandInteraction;
            if (body.data.name === 'tag') tag(req, res, body);
            if (body.data.name === 'viewtags') viewtags(req, res, body);
        }
    });

    return router;
}
