import { Router } from 'express';
import { getChannelWebhooks, createWebhook, createThread, executeWebhook } from '../utils/discord';

type SubmitBody = {
    title: string;
    tags: string[];
    url: string;
    channelId: string;
    comment: string;
}

export default function submit(channels: { id: string; name: string }[]) {
    const router = Router();

    router.post('/', async (req, res) => {
        const { title, tags, url, channelId, comment } = req.body as SubmitBody;
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

        if (!thread || (thread as any).message) {
            console.error('Could not create thread', (thread as any).message);
            return res.sendStatus(500).send('Could not create new thread');
        }

        const success = await executeWebhook(
            webhook.id,
            webhook.token,
            `<@${req.user.id}>\n${tags.map(x => `#${x}`).join(' ')}\n${url}\n\n${comment.trim()}`,
            req.user.username,
            `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.webp`,
            thread.id
        );

        if (!success) {
            return res.sendStatus(500).send('Could not execute webhook');
        }

        res.sendStatus(204);
    });

    return router;
}
