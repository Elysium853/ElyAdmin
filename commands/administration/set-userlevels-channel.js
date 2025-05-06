const { SlashCommandBuilder, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { writeFileSync } = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-userlevels-channel')
        .setDescription('Sets the ticket channel for tracking user levels.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to set as the as the user levels tracking channel.')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

    async execute(interaction) {
        const channel = interaction.options.getChannel('channel');
        if (!channel || channel.type !== 0) {
            return interaction.reply({ content: 'Please provide a valid text channel.', flags: MessageFlags.Ephemeral });
        }
        const configPath = path.join(__dirname, `../../.private/${interaction.guild.id}_config.json`);
        try {
            let guildConfig = {};
            guildConfig = require(configPath);
            guildConfig.userLevelsChannelId = channel.id;
            writeFileSync(configPath, JSON.stringify(guildConfig, null, 2));
            await interaction.reply({ content: `Ticket channel set to ${channel}.`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error('Error setting ticket channel:', error);
            await interaction.reply({ content: 'An error occurred while setting the ticket channel.', flags: MessageFlags.Ephemeral });
        }
    }
};