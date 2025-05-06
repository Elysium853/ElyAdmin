const { ChannelType, MessageFlags, PermissionsBitField, SlashCommandBuilder, ThreadChannel } = require('discord.js');

module.exports = {
    cooldown: 240,
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Open or close a ticket.')
        .addSubcommandGroup(subcommandGroup =>
            subcommandGroup
                .setName('manage')
                .setDescription('Manage tickets.')
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('open')
                        .setDescription('Open a new ticket.')
                )
                .addSubcommand(subcommand =>
                    subcommand
                        .setName('close')
                        .setDescription('Close the current ticket.')
                )
        ),

    async execute(interaction) {
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const guild_config = require(`../../.private/${interaction.guild.id}_config.json`);
        if (!guild_config.ticketChannelId) {
            console.log(guild_config);
            return await interaction.editReply({
                content: 'An admin needs to set the Ticket channel.',
                flags: MessageFlags.Ephemeral
            });
        }
        const subcommand = interaction.options.getSubcommand();
        const guild = await client.guilds.cache.get(interaction.guild.id);
        const member = interaction.member;
        const CurrentDateYYYYMMDD_hhmmss = client.utils.getCurrentDateYYYYMMDD_hhmmss();
        const ticketChannel = await client.channels.fetch(guild_config.ticketChannelId);
        if (!ticketChannel) {
            return await interaction.editReply({
                content: 'Ticket channel not found.',
                flags: MessageFlags.Ephemeral
            });
        }

        if (subcommand === 'open') {
            let existingTicket = null;

            try {
                existingTicket = await ticketChannel.threads.cache.find(x => x.name === member.id);
            } catch (error) {
                console.error(error);
            }

            if (existingTicket) {
                return await interaction.editReply({
                    content: `**You already have an existing ticket!**\n<#${existingTicket.id}>`,
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                const thread = await ticketChannel.threads.create({
                    name: member.id,
                    autoArchiveDuration: 60,
                    type: ChannelType.PrivateThread,
                    reason: `Ticket opened for <@${member.id}>`
                });

                await thread.members.add(member.id);
                await guild.members.cache.forEach(async (member) => {
                    if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        await thread.members.add(member.user.id);
                    }
                });

                return await interaction.editReply({
                    content: `Ticket opened: <#${thread.id}>`,
                    flags: MessageFlags.Ephemeral
                })
            } catch (error) {
                console.error(error);
                return await interaction.editReply({
                    content: 'ERROR: Unable to create thread.',
                    flags: MessageFlags.Ephemeral
                });
            }
        } else if (subcommand === 'close') {
            if (!(interaction.channel instanceof ThreadChannel)) {
                return await interaction.editReply({
                    content: 'This command can only be used in a ticket thread!',
                    flags: MessageFlags.Ephemeral
                });
            }

            try {
                const thread = interaction.channel;
                if (!(thread instanceof ThreadChannel)) {
                    return await interaction.editReply({
                        content: 'This command can only be used in a ticket thread!',
                        flags: MessageFlags.Ephemeral
                    });
                }
                // Remove non-admin members
                for (const memberId of thread.members.cache.keys()) {
                    const member = await guild.members.fetch(memberId);
                    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                        await ticketChannel.permissionOverwrites.edit(member, {
                            ViewChannel: false
                        });
                        await thread.members.remove(memberId);
                    }
                }
                await thread.setName(`ARCHIVED-${thread.name}_${CurrentDateYYYYMMDD_hhmmss}`);
                await interaction.editReply({ content: 'Closed ticket!' });
                await thread.setArchived(true);
                return;
            } catch (error) {
                console.error('Error closing ticket:', error);
                return await interaction.editReply({
                    content: 'There was an error closing the ticket.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
}
