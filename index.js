// Require discord.js
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// ===== User & Channel to Notify on Buy =====
const OWNER_ID = '1397900754387472454'; // Mentioned when someone buys
const BUY_CHANNEL_ID = '1409512210044162081'; // Channel ID for notifications

// ===== Products =====
// For demo, we include only Rifles. Add Shotguns, Snipers, Bombs, Armor, Attachments in same structure.
const products = {
    rifle: [
        { id: 1, name: "AK-47", description: "Assault rifle, 7.62×39mm, USSR, 30-round mag, 300–400m effective", price: 1500, image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/AK-47_type_II_Part_DM-ST-89-01131.jpg" },
        { id: 2, name: "AKM", description: "Modernized AK-47, lighter, same caliber", price: 1600, image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/AKM_type_II_Part_DM-ST-89-01132.jpg" },
        // ... add all rifles, shotguns, snipers, bombs/c4, armor/knives, attachments
    ],
    shotgun: [
        { id: 101, name: "Remington 870", description: "Pump-action, 12 gauge, 4–8 rounds", price: 1200, image: "https://upload.wikimedia.org/wikipedia/commons/3/30/Remington_870_Pump_Shotgun.jpg" },
        // ... add 19 more
    ],
    sniper: [],
    bombs: [],
    armor: [],
    attachments: []
};

// ===== Ready Event =====
client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

// ===== Commands =====
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    // === SHOP COMMAND ===
    if (message.content.toLowerCase() === '!shop') {
        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('shop_select')
                    .setPlaceholder('Select a category')
                    .addOptions([
                        { label: 'Rifles', value: 'rifle' },
                        { label: 'Shotguns', value: 'shotgun' },
                        { label: 'Snipers', value: 'sniper' },
                        { label: 'Bombs/C4', value: 'bombs' },
                        { label: 'Armor & Knives', value: 'armor' },
                        { label: 'Attachments', value: 'attachments' },
                    ])
            );

        await message.reply({ content: 'Select a category to view products:', components: [row] });
    }

    // === BUY COMMAND ===
    if (message.content.toLowerCase().startsWith('!buy')) {
        const args = message.content.split(' ');
        const itemId = parseInt(args[1]);
        let foundItem = null;

        for (const cat in products) {
            foundItem = products[cat].find(i => i.id === itemId);
            if (foundItem) break;
        }

        if (!foundItem) return message.reply('Item not found.');

        message.reply(`You bought **${foundItem.name}** for $${foundItem.price}!`);
        const buyChannel = message.guild.channels.cache.get(BUY_CHANNEL_ID);
        if (buyChannel) {
            buyChannel.send(`<@${OWNER_ID}>: **${message.author.tag}** bought **${foundItem.name}** ($${foundItem.price})`);
        }
    }
});

// ===== Interaction (Category Select) =====
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === 'shop_select') {
        const category = interaction.values[0];
        const items = products[category];

        if (!items || items.length === 0) {
            return interaction.reply({ content: 'No items in this category.', ephemeral: true });
        }

        // Build embed for first 10 items (Discord limit 6000 chars)
        const embed = new EmbedBuilder()
            .setTitle(`${category.charAt(0).toUpperCase() + category.slice(1)} Shop`)
            .setColor(0x00FF00);

        items.slice(0, 10).forEach(item => {
            embed.addFields({ name: `${item.id}. ${item.name} - $${item.price}`, value: item.description });
            embed.setImage(item.image); // Optional: Discord only allows 1 image per embed
        });

        await interaction.reply({ embeds: [embed] });
    }
});

// ===== Login =====
// Put your Discord bot token in a .env file, and load it securely!
client.login(process.env.DISCORD_BOT_TOKEN);