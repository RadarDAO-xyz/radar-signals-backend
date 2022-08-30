require('dotenv').config();
const {
    SlashCommandBuilder,
    SlashCommandStringOption,
    SlashCommandChannelOption
} = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes, ChannelType } = require('discord-api-types/v10');

const rest = new REST({}).setToken(process.env.BOT_TOKEN);

const commands = [
    new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Add a tag to a signal')
        .setDMPermission(false)
        // .addChannelOption(
        //     new SlashCommandChannelOption()
        //         .setName('signal')
        //         .setDescription('The thread channel to add a tag to')
        //         .addChannelTypes(ChannelType.GuildPublicThread)
        //         .setRequired(true)
        // )
        .addStringOption(
            new SlashCommandStringOption()
                .setName('name')
                .setDescription('The name of the tag(s) to add, you can add multiple tags by separating them with spaces or commas')
                .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('viewtags')
        .setDescription('View the currently existing tags for a signal')
        .setDMPermission(false)
        .addChannelOption(
            new SlashCommandChannelOption()
                .setName('signal')
                .setDescription('The thread channel view tags of')
                .addChannelTypes(ChannelType.GuildPublicThread)
                .setRequired(true)
        )
];

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
    body: commands.map(x => x.toJSON())
})
    .then(cmds => {
        console.log('Successfully deployed', cmds.length, 'commands');
    })
    .catch(console.error);
