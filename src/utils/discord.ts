import fetch from 'node-fetch';
import { RADAR_GUILD_ID } from '../constants';
import { APIThreadChannel, APIUser, APIWebhook } from 'discord-api-types/v10';

export const isUserARadar = async (access_token: string) => {
    const guildResponse = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`
        }
    });
    if (guildResponse.ok) {
        const guilds = await guildResponse.json();
        return !!guilds.find((g: { id: string }) => g.id === RADAR_GUILD_ID);
    } else {
        throw new Error(
            'DiscordAPIError: Could not fetch user guilds: ' + guildResponse.statusText
        );
    }
};

export const getUserInfo = async (access_token: string): Promise<APIUser> => {
    const response = await fetch(`https://discord.com/api/v10/users/@me`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`
        }
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error('DiscordAPIError: Could not fetch user info: ' + response.statusText);
    }
};

export const getChannelWebhooks = async (channelId: string): Promise<APIWebhook[]> => {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/webhooks`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bot ${process.env.BOT_TOKEN}`
        }
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error(
            'DiscordAPIError: Could not fetch channel webhooks: ' + response.statusText
        );
    }
};

export const createWebhook = async (channelId: string, name: string): Promise<APIWebhook> => {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/webhooks`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bot ${process.env.BOT_TOKEN}`
        },
        body: JSON.stringify({
            name
        })
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error('DiscordAPIError: Could not create webhook: ' + response.statusText);
    }
};

export const getWebhook = async (webhookId: string): Promise<APIWebhook> => {
    const response = await fetch(`https://discord.com/api/v10/webhooks/${webhookId}`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bot ${process.env.BOT_TOKEN}`
        }
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error('DiscordAPIError: Could not get webhook: ' + response.statusText);
    }
};

export const createThread = async (channelId: string, name: string): Promise<APIThreadChannel> => {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/threads`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bot ${process.env.BOT_TOKEN}`
        },
        body: JSON.stringify({
            name: name,
            type: 11
        })
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error('DiscordAPIError: Could not create thread: ' + response.statusText);
    }
};

export const executeWebhook = async (
    webhookId: string,
    token: string | undefined,
    content: string,
    username: string,
    avatarURL: string,
    threadId: string
) => {
    let webhookUrl = `https://discord.com/api/v10/webhooks/${webhookId}`;
    if (token) webhookUrl += `/${token}`;
    webhookUrl += `?thread_id=${threadId}`;

    const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            content,
            username,
            avatar_url: avatarURL
        })
    });
    return response.ok;
};
