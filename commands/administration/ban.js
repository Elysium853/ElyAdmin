const { EmbedBuilder: discordEmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
  cooldown: 30,
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('BAN member.')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason the member is being banned')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('id')
        .setDescription('The Discord user ID to BAN')
        .setRequired(false)
    )
    .addUserOption(option =>
      option
        .setName('member')
        .setDescription('The Guild member to BAN')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });
    const member = interaction.options.getMember('member');
    const id = interaction.options.getString('id');
    const reason = interaction.options.getString('reason');
    let bannedId;

    // Validate input
    if (!member && !id) {
      return interaction.editReply({ content: "Please provide a member to ban (using @mention) or a user ID.", flags: MessageFlags.Ephemeral });
    }

    if (id) {
      const userIdRegex = /^\d{18,19}$/; // Check for a valid Discord user ID format
      if (!userIdRegex.test(id)) {
        return interaction.editReply({ content: "Invalid user ID format. Please provide a valid Discord user ID.", flags: MessageFlags.Ephemeral });
      }
      bannedId = id;
    } else {
      bannedId = member.user.id;
    }

    try {
      const bannedUser = await client.users.fetch(bannedId, { force: true });
      const embed = new discordEmbedBuilder()
        .setColor('Red')
        .setTitle(`User Banned`)
        .setDescription(`**User:** ${bannedUser.username} (ID: ${bannedUser.id})`)
        .setThumbnail(bannedUser.displayAvatarURL())
        .addFields(
          { name: 'Reason:', value: reason },
          { name: 'Banned By:', value: interaction.user.tag }
        )
        .setTimestamp();
      try {
        await bannedUser.send({ embeds: [embed] });
      } catch (error) {
        console.error(`Failed to send DM to ${bannedUser.username}`, error);
      }
      const logChannel = interaction.guild.channels.cache.get(client.utils.configFile.administrationChId);
      if (logChannel) {
        await logChannel.send({ embeds: [embed] });
      } else {
        console.error('Log channel not found.');
      }
      await interaction.guild.members.ban(bannedId, { reason });
      return await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      if (error.code === 50010) { // User already banned error
        return interaction.editReply({ content: `<@${interaction.user.id}>, User with ID ${bannedId} is already banned.`, flags: MessageFlags.Ephemeral });
      } else {
        console.error(error);
        return interaction.editReply({ content: `Something went wrong, check logs!`, flags: MessageFlags.Ephemeral });
      }
    }
  },
};