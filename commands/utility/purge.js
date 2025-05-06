const { MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 30,
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Purge, non-pinned messages.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to purge.')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(99)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        const amount = await interaction.options.getInteger('amount');
        try {
            const fetched = await interaction.channel.messages.fetch({ limit: amount });
            const notPinned = fetched.filter(msg => !msg.pinned);
            await interaction.channel.bulkDelete(notPinned);
            return await interaction.editReply({ content: `Successfully deleted ${notPinned.size} non-pinned messages!`, flags: MessageFlags.Ephemeral });
        } catch (error) {
            console.error(error);
            return await interaction.editReply({ content: `**ERROR:** Check LOGS!`, flags: MessageFlags.Ephemeral });
        }
    }
}