const { Client, GatewayIntentBits, PermissionsBitField } = require('discord.js');
const config = require('./config.js');
const database = require('./src/database.js');
const suggestion = require('./src/commands/suggestion.js');
const help = require('./src/commands/help.js');
const rateLimit = require('./src/commands/utils/rateLimit.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

const PREFIX = config.prefix;

client.once('ready', async () => {
    console.log(`\n`);
    console.log(`┌────────────────────────────────────────────────────────┐`);
    console.log(`│           L I V E C O R D   D E V E L O P M E N T       │`);
    console.log(`├────────────────────────────────────────────────────────┤`);
    console.log(`│                     Suggestion Bot                      │`);
    console.log(`└────────────────────────────────────────────────────────┘`);
    console.log(`\n`);
    console.log(`Bot Name     : ${client.user.tag}`);
    console.log(`Prefix       : ${PREFIX}`);
    console.log(`Owner ID     : ${config.ownerId}`);
    console.log(`\n`);
    
    await database.connect();
    console.log(`Database connected`);
    console.log(`\n`);
    
    await client.user.setPresence({
        activities: [{ name: `${PREFIX}help | LiveCord Development`, type: 2 }],
        status: 'online'
    });
    
    console.log(`Bot is ready`);
    console.log(`\n`);
    console.log(`┌────────────────────────────────────────────────────────┐`);
    console.log(`│           Made by LiveCord Development                 │`);
    console.log(`└────────────────────────────────────────────────────────┘`);
    console.log(`\n`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(PREFIX)) return;
    
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();
    
    // Rate limit check
    const rateCheck = rateLimit.checkRateLimit(message.author.id, command, 3, 10000);
    if (!rateCheck.allowed) {
        return message.reply({ content: rateCheck.message, ephemeral: true });
    }
    
    if (command === 'help') {
        await help.sendHelpMenu(message);
        return;
    }
    
    if (command === 'suggest') {
        if (args.length === 0) {
            return message.reply({ content: `Please provide a suggestion! Usage: ${PREFIX}suggest <your suggestion>`, ephemeral: true });
        }
        const suggestionText = args.join(' ');
        await suggestion.submitSuggestion(message, suggestionText);
        return;
    }
    
    if (command === 'setsuggest') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply({ content: 'You need Manage Server permission!', ephemeral: true });
        }
        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply({ content: `Usage: ${PREFIX}setsuggest #channel`, ephemeral: true });
        }
        await suggestion.setSuggestionChannel(message.guildId, channel.id);
        return message.reply({ content: `Suggestion channel set to ${channel}`, ephemeral: true });
    }
    
    if (command === 'removesuggest') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply({ content: 'You need Manage Server permission!', ephemeral: true });
        }
        await suggestion.removeSuggestionChannel(message.guildId);
        return message.reply({ content: 'Suggestion channel removed', ephemeral: true });
    }
    
    if (command === 'setlogs') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply({ content: 'You need Manage Server permission!', ephemeral: true });
        }
        const channel = message.mentions.channels.first();
        if (!channel) {
            return message.reply({ content: `Usage: ${PREFIX}setlogs #channel`, ephemeral: true });
        }
        await suggestion.setLogChannel(message.guildId, channel.id);
        return message.reply({ content: `Log channel set to ${channel}`, ephemeral: true });
    }
    
    if (command === 'setthreshold') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return message.reply({ content: 'You need Manage Server permission!', ephemeral: true });
        }
        const threshold = parseInt(args[0]);
        if (isNaN(threshold) || threshold < 1) {
            return message.reply({ content: 'Please provide a valid number (minimum 1)', ephemeral: true });
        }
        await suggestion.setThreshold(message.guildId, threshold);
        return message.reply({ content: `Vote threshold set to ${threshold} upvotes`, ephemeral: true });
    }
    
    if (command === 'approve' || command === 'deny' || command === 'consider') {
        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return message.reply({ content: 'You need Manage Messages permission!', ephemeral: true });
        }
        const suggestionId = args[0];
        if (!suggestionId) {
            return message.reply({ content: `Usage: ${PREFIX}${command} <suggestion_id>`, ephemeral: true });
        }
        
        let status = '';
        if (command === 'approve') status = 'approved';
        if (command === 'deny') status = 'denied';
        if (command === 'consider') status = 'considered';
        
        await suggestion.moderateSuggestion(message, suggestionId, status);
        return;
    }
});

client.on('interactionCreate', async (interaction) => {
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('help_select_menu_')) {
        await help.handleHelpMenu(interaction);
        return;
    }
    
    if (interaction.isButton() && interaction.customId.startsWith('back_to_modules_')) {
        await help.backToModules(interaction);
        return;
    }
    
    if (interaction.isButton()) {
        if (interaction.customId === 'upvote') {
            await suggestion.handleVote(interaction, 'upvote');
            return;
        }
        
        if (interaction.customId === 'downvote') {
            await suggestion.handleVote(interaction, 'downvote');
            return;
        }
    }
});

client.login(config.token);