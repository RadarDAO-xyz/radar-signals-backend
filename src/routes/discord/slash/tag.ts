import { EmbedBuilder } from '@discordjs/builders';
import Airtable from 'airtable';
import {
    APIApplicationCommandInteractionDataChannelOption,
    APIApplicationCommandInteractionDataStringOption,
    APIChatInputApplicationCommandInteraction
} from 'discord-api-types/v10';
import { Request, Response } from 'express';
import { followUp, resolveChannelURL } from '../../../utils/discord';

export default async function tag(
    req: Request,
    res: Response,
    i: APIChatInputApplicationCommandInteraction
) {
    res.json({ type: 5, data: { flags: 1 << 6 } }); // Defer ephemeral
    const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(
        process.env.AIRTABLE_THREAD_BASE_ID || ''
    );

    function getTable() {
        return process.flags.dev ? base('Table 2') : base('Table 1');
    }

    const threadId = i.channel_id;
    const tag = (
        i.data.options?.find(
            x => x.name === 'name'
        ) as APIApplicationCommandInteractionDataStringOption
    ).value.split(/[, ]/);

    console.log(`Attempting to add a new tag (${tag}) to a thread (${threadId})`);
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

    const newtags = [...(results[0].fields.Tags as string[]), ...tag];

    const success = await results[0]
        .updateFields(
            {
                Tags: newtags
            },
            { typecast: true }
        )
        .catch(e => {
            console.error(e);
            followUp(i.token, {
                content: 'An error occurred on the server side! Please try again later'
            });
        });

    if (!success) return;

    followUp(i.token, {
        embeds: [
            new EmbedBuilder()
                .setTitle('Tags updated!')
                .addFields({ name: 'Tags', value: newtags.map(x => `\`#${x}\``).join('\n') })
                .setColor(0x00ff00)
                .toJSON()
        ]
    });
}
