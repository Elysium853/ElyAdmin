// autoClean.js
const {
    ChannelType,
    PermissionFlagsBits,
    MessageFlags,
    SlashCommandBuilder,
} = require('discord.js');
const { existsSync, readFileSync, writeFileSync } = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('autoclean')
        .setDescription('Manage autoclean channels.')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('add')
                .setDescription('Add a channel to autoclean.')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('The channel to add.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('remove')
                .setDescription('Remove a channel from autoclean.')
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('The channel to remove.')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let channel;
        if (subcommand === 'add' || subcommand === 'remove') {
            channel = interaction.options.getChannel('channel');
        }
        let autocleanChannels = {};
        const autocleansfile = '.private/autocleanChannels.json';
        try {
            if (existsSync(autocleansfile)) {
                const data = readFileSync(autocleansfile, 'utf8');
                autocleanChannels = JSON.parse(data);
            }
        } catch (error) {
            console.error('Error reading autocleanChannels.json:', error);
            return interaction.reply({
                content: 'An error occurred while reading the configuration.',
                flags: MessageFlags.Ephemeral,
            });
        }

        if (subcommand === 'add') {
            if (!autocleanChannels[channel.id]) {
                autocleanChannels[channel.id] = channel.name;
                try {
                    writeFileSync(
                        autocleansfile,
                        JSON.stringify(autocleanChannels, null, 2)
                    );
                    return interaction.reply({
                        content: `Channel ${channel.name} added to autoclean.`,
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (error) {
                    console.error('Error writing to autocleanChannels.json:', error);
                    return interaction.reply({
                        content: 'An error occurred while saving the configuration.',
                        flags: MessageFlags.Ephemeral,
                    });
                }
            } else {
                return interaction.reply({
                    content: `Channel ${channel.name} is already in the autoclean list.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        } else if (subcommand === 'remove') {
            if (autocleanChannels[channel.id]) {
                delete autocleanChannels[channel.id];
                try {
                    writeFileSync(
                        autocleansfile,
                        JSON.stringify(autocleanChannels, null, 2)
                    );
                    return interaction.reply({
                        content: `Channel ${channel.name} removed from autoclean.`,
                        flags: MessageFlags.Ephemeral,
                    });
                } catch (error) {
                    console.error('Error writing to autocleanChannels.json:', error);
                    return interaction.reply({
                        content: 'An error occurred while saving the configuration.',
                        flags: MessageFlags.Ephemeral,
                    });
                }
            } else {
                return interaction.reply({
                    content: `Channel ${channel.name} is not in the autoclean list.`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    },
};