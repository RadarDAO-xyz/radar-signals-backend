import fetch from 'node-fetch';
import { RADAR_GUILD_ID } from '../constants';
import { APIThreadChannel, APIUser, APIWebhook } from 'discord-api-types/v10';

export const isUserARadar = async (access_token: string) => {
    const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${RADAR_GUILD_ID}`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`
        }
    });
    return guildResponse.ok;
};

export const getUserInfo = async (access_token: string): Promise<APIUser> => {
    const response = await fetch(`https://discord.com/ap/v10i/oauth2/@me`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${access_token}`
        }
    });
    return response.json();
};

export const getChannelWebhooks = async (channelId: string): Promise<APIWebhook[]> => {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/webhooks`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bot ${process.env.BOT_TOKEN}`
        }
    });
    return response.json();
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
    return response.json();
};

export const getWebhook = async (webhookId: string): Promise<APIWebhook> => {
    const response = await fetch(`https://discord.com/api/v10/webhooks/${webhookId}`, {
        headers: {
            Accept: 'application/json',
            Authorization: `Bot ${process.env.BOT_TOKEN}`
        }
    });
    return response.json();
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
    return response.json();
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
