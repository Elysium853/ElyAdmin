const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageBulkDelete,
    async execute(messages) {
        const firstMessage = messages.first();
        if (!firstMessage) return;

        const guild = firstMessage.guild;
        if (!guild) return;

        try {
            const guild_config = require(`../.private/${guild.id}_config.json`);
            if (!guild_config.botLogsChannelId) {
                return;
            }

            const logChannel = guild.channels.cache.get(guild_config.botLogsChannelId);
            if (!logChannel) return;

            const messageLogs = messages.map((message) => {
                if (!message || !message.content) return null;
                try {
                    const readableTime = new Date(message.createdTimestamp).toUTCString();
                    return {
                        embeds: [
                            new EmbedBuilder()
                                .setColor('Red')
                                .setTitle(`Message deleted in: <#${message.channelId}>`)
                                .setDescription(`Message created: ${readableTime}\nAuthor: ${message.author?.username || 'Unknown'}`)
                                .addFields({
                                    name: `CONTENT:`,
                                    value: message.content.length > 1024 ? message.content.substring(0, 1021) + '...' : message.content, //handle long messages
                                })
                                .setTimestamp(),
                        ],
                    };
                } catch (error) {
                    console.error('Error creating embed:', error);
                    return null;
                }
            }).filter(Boolean);

            if (messageLogs.length > 0) {
                const chunks = [];
                for (let i = 0; i < messageLogs.length; i += 10) {
                    chunks.push(messageLogs.slice(i, i + 10));
                }
                for (const chunk of chunks) {
                    await logChannel.send({ embeds: chunk.flatMap(log => log.embeds) }); // Send each chunk
                }
            }
        } catch (error) {
            console.error('Error in messageBulkDelete event:', error);
        }
    }
}