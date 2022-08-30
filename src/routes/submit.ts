import { APIWebhook } from 'discord-api-types/v10';
import { Router } from 'express';
import { getChannelWebhooks, createWebhook, createThread, executeWebhook, resolveChannelURL } from '../utils/discord';
import Airtable from 'airtable';

type SubmitBody = {
    title: string;
    tags: string[];
    url: string;
    channelId: string;
    comment: string;
};

export default function submit(channels: { id: string; name: string }[]) {
    const router = Router();

    const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
        process.env.AIRTABLE_THREAD_BASE_ID || ''
    );

    function getTable() {
        return process.flags.dev ? base('Table 2') : base('Table 1');
    }

    router.post('/', async (req, res) => {
        console.log(`${req.user.username}#${req.user.discriminator} is submitting a signal`);

        const { title, tags, url, channelId, comment } = req.body as SubmitBody;
        const channel = channels.find(channel => channel.id === channelId);
        if (!channel) {
            return res.sendStatus(400);
        }

        const webhooks = await getChannelWebhooks(channelId).catch(console.error);
        if (!webhooks) return res.sendStatus(500);

        let webhook = webhooks.find(w => w.application_id == process.env.CLIENT_ID);
        if (!webhook) {
            webhook = (await createWebhook(channelId, 'Radar Extension Poster').catch(
                console.error
            )) as APIWebhook | undefined;
        }

        if (!webhook) {
            console.error('No webhook found, could not create new one');
            return res.sendStatus(500).send('No webhook found, could not create new one');
        }

        const thread = await createThread(channelId, title).catch(console.error);

        if (!thread) {
            console.error('Could not create thread', (thread as any).message);
            return res.sendStatus(500).send('Could not create new thread');
        }

        const success = await executeWebhook(
            webhook.id,
            webhook.token,
            `<@${req.user.id}>\n${tags.map(x => `#${x}`).join(' ')}\n${url}\n\n${
                comment.trim().length > 0 ? `On our RADAR: ${comment.trim()}` : ''
            }`.trim(),
            req.user.username,
            `https://cdn.discordapp.com/avatars/${req.user.id}/${req.user.avatar}.webp`,
            thread.id
        ).catch(console.error);

        if (!success) {
            console.error('Could not execute webhook');
            return res.sendStatus(500).send('Could not execute webhook');
        }

        const created = await getTable()
            .create(
                {
                    'Thread Name': thread.name,
                    Link: resolveChannelURL(thread.guild_id as string, thread.id),
                    'Signal Channel': channel.name,
                    Tags: tags,
                    Curator: `${req.user.username}#${req.user.discriminator}`,
                    Status: 'ACTIVE',
                    Comments: thread.message_count,
                    Timestamp: Date.now()
                },
                {
                    typecast: true
                }
            )
            .catch(e => console.error(e));

        if (!created) {
            console.error('Could not create airtable entry');
            return res.sendStatus(500).send('Could not create airtable entry');
        }

        console.log(
            `${req.user.username}#${req.user.discriminator} has submitted a signal [${resolveChannelURL(thread.guild_id as string, thread.id)}]`
        );
        res.sendStatus(204);
    });

    return router;
}
