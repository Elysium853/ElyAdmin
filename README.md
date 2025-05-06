# ElyAdmin
ElyAdmin is a custom Discord bot designed by Elysium (elysium853).

```
git clone https://github.com/Elysium853/ElyAdmin
```
```
cd ./ElyAdmin
```
```
npm install --save cron
```
```
npm install --save discord.js
```
```
mkdir .private .logs
```
```
cp config_sample.json .private/config.json
```
- Copy your `Discord ID` to the `.private/config.json` file as "botOwnerId"
## Discord Developer Portal Instructions
**Create a new application**:
  - Go to [Discord Developer Portal](https://discord.com/developers/applications).
  - Click `New Application` and follow the prompts.
    - Copy the `APPLICATION ID` to the `.private/config.json` file as "botId"
    - Copy the `PUBLIC KEY` to the `.private/config.json` as "botPublicKey"
  - Select `Bot` on the left sidebar.
  - Reset Token:
    - Copy the token to `.private/config.json` as "botToken".
  - Enable Intents:
    - PRESENCE INTENT
    - SERVER MEMBERS INTENT
    - MESSAGE CONTENT INTENT
  - Select `OAuth2` on the left sidebar.
    - select `bot` checkbox
    - select `Administrator` in the bottom section
    - Copy the `GENERATED URL` to `.private/config.json` as "botInviteLink"
  - Close the [Discord Developer Portal]
  - Invite the bot to your server using the link you copied.
```
node modules/deploy-commands.js
```
## Set BOT channels
**On the Discord server, run the following / commands to set the bot channels**
  - The channel where the User tickets threads will be stored
```
/set-ticket-channel
```
  - The channel where the bot logs will be sent
```
/set-botlogs-channel
```
  - Set USER LEVEL TRACKING channel
```
/set-userlevels-channel: <Channel>
```
## Install Service
- Follow the instructions in the ElyAdmin.service file to install the bot as a service
## Node (if node isn't installed)
```
cd ~
```
```
curl --output - https://raw.githubusercontent.com/nvm-sh/nvm/master/install.sh | bash
```
```
nvm install --lts
```
## Updating the Repo
```
git add --all
```
```
git commit --message "brief concise description of the commit"
```
```
git push
```
## BOT Commands
  - Add channels to Auto Clean (removes any NON-PINNED messages from that channel every 10 minutes)
```
/autoclean add channel: <Channel>
```
  - Remove channels from Auto Clean
```
/autoclean remove channel: <Channel>
```
  - BAN members from server (I recommend not doing this, but it's there)
```
/ban reason: <reason> id: <Discord ID> or member: <Member>
```
  - Fetch user's avatar, banner and basic user info
```
/fetch-avatar id: <Discord ID> or member: <Member>
```
  - Purge NON-PINNED messages from a channel 1 up to 99 messages
```
/purge amount: <1-99>
```
  - Open and Close TICKETS
```
/ticket manage open
/ticket manage close
```
  - Set USER LEVEL TRACKING channel
```
/set-userlevels-channel: <Channel>
```
  - Show all users in the specified level
```
/show-levels level: <integer>
```
  - Get Urban Dictionary definition for a word or phrase
```
/urban word: <word>
```
  - Warn and OPTIONALLY mute a user
```
/warn member-to-warn: <Member> reason: <reason> and optional minutes to mute length: <1 to 9999>
```
# Tested on
Ubuntu 22.04
- node v20.17.0
- npm 10.8.2
- cron 3.2.1
- discord.js 14.16.3
