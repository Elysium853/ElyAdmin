const { AttachmentBuilder: discordAttachmentBuilder, EmbedBuilder: discordEmbedBuilder, Events: discordEvents } = require('discord.js');
const userActivityTracker = require('../modules/userActivityTracker');


module.exports = {
    name: discordEmbedBuilder,
    name: discordAttachmentBuilder,
    name: discordEvents.MessageCreate,

    async execute(message) {
        const userLevels = require('../modules/user-level-tracking')(client);
        let lowerCaseContent;
        if (!message.guildId) {
            return; //assume DM
        }
        if (!message.author.bot) {
            lowerCaseContent = message.content.toLowerCase();
            userActivityTracker.trackActivity(message.member, 'message');
            await userLevels.parse_message(message);
            await parse_lowerCaseContent(message, lowerCaseContent);
        } else {
            return;
        }
    }
}

async function parse_lowerCaseContent(message, lowerCaseContent) {
    let regEx;

    // &sample
    regEx = new RegExp(/^&sample$/i);
    if ((lowerCaseContent.match(regEx) !== null)) {
        // code here
        return;
    }
}
