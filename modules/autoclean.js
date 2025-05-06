// autoclean.js
const { existsSync, readFileSync } = require('fs');
const purgeMessages = require('./purgeMessages');

module.exports = async function runAutoClean(client) {
    const autocleansfile = '.private/autocleanChannels.json';
    try {
        if (existsSync(autocleansfile)) {
            const data = readFileSync(autocleansfile, 'utf8');
            const autocleanChannels = JSON.parse(data);

            for (const channelId in autocleanChannels) {
                if (autocleanChannels.hasOwnProperty(channelId)) {
                    const channel = await client.channels.fetch(channelId).catch(console.error);
                    if (channel) {
                        await purgeMessages(channel, 99);
                    } else {
                        console.error(`Channel with ID ${channelId} not found.`);
                    }
                }
            }
        } else {
            console.error(`${autocleansfile} not found.`);
        }
    } catch (error) {
        console.error('Error in autoclean process:', error);
    }
};