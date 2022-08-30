import { EmbedBuilder } from '@discordjs/builders';
import Airtable from 'airtable';
import {
    APIApplicationCommandInteractionDataChannelOption,
    APIChatInputApplicationCommandInteraction
} from 'discord-api-types/v10';
import { Request, Response } from 'express';
import { followUp, resolveChannelURL } from '../../../utils/discord';

export default async function viewtags(
    req: Request,
    res: Response,
    i: APIChatInputApplicationCommandInteraction
) {
    res.json({ type: 5 }); // Defer
    const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
        process.env.AIRTABLE_THREAD_BASE_ID || ''
    );

    function getTable() {
        return process.flags.dev ? base('Table 2') : base('Table 1');
    }

    const threadId = (
        i.data.options?.find(
            x => x.name === 'signal'
        ) as APIApplicationCommandInteractionDataChannelOption
    ).value;
    console.log(threadId);
    const url = resolveChannelURL(i.guild_id as string, threadId);

    const results = await getTable()
        .select({
            filterByFormula: `{Link} = '${url}'`
        })
        .firstPage();

    if (results.length == 0) {
        return followUp(i.token, {
            content: 'That thread is not registered as a signal in the Airtable'
        });
    }

    followUp(i.token, {
        embeds: [
            new EmbedBuilder()
                .setTitle('Tags applied for this signal')
                .addFields({
                    name: 'Tags',
                    value: (results[0].fields.Tags as string[]).map(x => `\`#${x}\``).join('\n')
                })
                .setColor(0x00ff00)
                .toJSON()
        ]
    });
}
