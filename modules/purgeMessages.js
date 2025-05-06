// purgeMessages.js
const { MessageFlags } = require('discord.js');

module.exports = async function purgeMessages(channel, amount, interaction) {
    try {
        const fetched = await channel.messages.fetch({ limit: amount });
        const notPinned = fetched.filter(msg => !msg.pinned);
        await channel.bulkDelete(notPinned);
        if (interaction) {
            return await interaction.editReply({
                content: `Successfully deleted ${notPinned.size} non-pinned messages!`,
                flags: MessageFlags.Ephemeral,
            });
        }
        return;
    } catch (error) {
        console.error(error);
        if (interaction) {
            return await interaction.editReply({
                content: `**ERROR:** Check LOGS!`,
                flags: MessageFlags.Ephemeral,
            });
        }
        return;
    }
};