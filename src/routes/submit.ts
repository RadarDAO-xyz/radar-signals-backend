import { Router } from 'express';
import { getChannelWebhooks, createWebhook, createThread, executeWebhook } from '../utils/discord';
const channels: { id: string; name: string }[] = require('../../channels.json');

const router = Router();

router.post('/', async (req, res) => {
    const { title, tags, url, channelId, comment } = req.body;
    if (!channels.find(channel => channel.id === channelId)) {
        return res.sendStatus(400);
    }

    const webhooks = await getChannelWebhooks(channelId);
    let webhook = webhooks.find(w => w.application_id == process.env.CLIENT_ID);
    if (!webhook) {
        webhook = await createWebhook(channelId, 'Radar Extension Poster');
    }

    if (!webhook) {
        return res.sendStatus(500).send('No webhook found, could not create new one');
    }

    const thread = await createThread(channelId, title);

    if (!thread) {
        return res.sendStatus(500).send('Could not create new thread');
    }

    const success = executeWebhook(
        webhook.id,
        webhook.token,
        `${comment}\n\n${url}`,
        req.user.username,
        `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.webp`,
        thread.id
    );

    if (!success) {
        return res.sendStatus(500).send('Could not execute webhook');
    }

    res.sendStatus(204);
});

export default router;
