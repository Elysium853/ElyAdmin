// userActivityTracker.js
const { readFileSync, writeFileSync } = require('fs');

const userActivityDataPath = ('./.private/userActivityData.json');
let userActivity = new Map();
try {
    const userActivityData = readFileSync(userActivityDataPath, 'utf8');
    const parsedUserActivityData = JSON.parse(userActivityData);
    userActivity = new Map(Object.entries(parsedUserActivityData).map(([guildId, guildData]) => [guildId, new Map(Object.entries(guildData))]));
} catch (error) {
    console.error(error);
}

const saveData = () => {
    const serializableData = Object.fromEntries(
        [...userActivity.entries()].map(([guildId, guildData]) => [guildId, Object.fromEntries(guildData)])
    );

    writeFileSync(userActivityDataPath, JSON.stringify(serializableData, null, 2), 'utf8');
};

module.exports = {
    trackActivity: (member, activityType) => {
        const guildId = member.guild.id;
        const userId = member.id;
        if (!userActivity.has(guildId)) {
            userActivity.set(guildId, new Map());
        }
        const guildActivity = userActivity.get(guildId);
        if (!guildActivity.has(userId)) {
            guildActivity.set(userId, {
                messages: 0,
                lastActive: Date.now(),
                joinDate: member.joinedTimestamp,
            });
        }
        const userData = guildActivity.get(userId);
        switch (activityType) {
            case 'message':
                userData.messages++;
                userData.lastActive = Date.now();
                break;
            default:
                break;
        }
        guildActivity.set(userId, userData);
        saveData();
    },

    getUserActivity: (guildId, userId) => {
        if (userActivity.has(guildId) && userActivity.get(guildId).has(userId)) {
            return userActivity.get(guildId).get(userId);
        }
        return null;
    },

    getGuildActivity: (guildId) => {
        if (userActivity.has(guildId)) {
            return userActivity.get(guildId);
        }
        return null;
    },

    getAllActivity: () => {
        return userActivity;
    },
};
