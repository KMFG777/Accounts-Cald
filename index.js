require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const RssParser = require('rss-parser');
const express = require('express');
const fs = require('fs');
const path = require('path');

const parser = new RssParser({ timeout: 15000 });
const app = express();
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const SOCIAL_FILE = path.join(DATA_DIR, 'social.json');
function loadSocial() {
    try { return JSON.parse(fs.readFileSync(SOCIAL_FILE, 'utf8')); }
    catch { return { accounts: {}, feeds: {} }; }
}
function saveSocial(obj) {
    fs.writeFileSync(SOCIAL_FILE, JSON.stringify(obj, null, 2));
}
let SOCIAL = loadSocial();
if (!SOCIAL.accounts) SOCIAL.accounts = {};
if (!SOCIAL.feeds) SOCIAL.feeds = {};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

const TOKEN = process.env.DISCORD_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const CLIENT_ID = process.env.CLIENT_ID || 'YOUR_BOT_CLIENT_ID_HERE';
const DEFAULT_NOTIFY_CHANNEL_ID = process.env.DEFAULT_NOTIFY_CHANNEL_ID || '';
const PORT = parseInt(process.env.PORT || '3000', 10);

let lastYoutubeVideoId = {};

function getGuildData(gid) {
    if (!SOCIAL.accounts[gid]) SOCIAL.accounts[gid] = {
        youtube: '', youtubeChannelId: '', notifyChannelId: DEFAULT_NOTIFY_CHANNEL_ID,
        instagram: '', twitch: '', kick: '', tiktok: '', twitter: '', threads: '', snapchat: '',
        bannerUrl: '', everyonePing: true
    };
    if (!SOCIAL.feeds[gid]) SOCIAL.feeds[gid] = {};
    return SOCIAL.accounts[gid];
}

const commands = [
    new SlashCommandBuilder()
        .setName('setaccounts')
        .setDescription('عرض / تعديل بطاقة كافة حسابات التواصل الاجتماعي'),
    new SlashCommandBuilder()
        .setName('config-social')
        .setDescription('[إدارة] ضبط إعدادات حسابات السوشيال ميديا')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub.setName('youtube')
            .setDescription('ربط حساب يوتيوب للفحص التلقائي')
            .addStringOption(o => o.setName('channel-id').setDescription('معرف قناة يوتيوب (UCxxxx)').setRequired(true))
            .addChannelOption(o => o.setName('notify-channel').setDescription('قناة التنبيهات').addChannelTypes(ChannelType.GuildText).setRequired(true)))
        .addSubcommand(sub => sub.setName('accounts')
            .setDescription('تعديل روابط حسابات التواصل لأمر /setaccounts')
            .addStringOption(o => o.setName('youtube').setDescription('رابط يوتيوب').setRequired(false))
            .addStringOption(o => o.setName('instagram').setDescription('رابط انستغرام').setRequired(false))
            .addStringOption(o => o.setName('twitch').setDescription('رابط تويتش').setRequired(false))
            .addStringOption(o => o.setName('kick').setDescription('رابط كيك').setRequired(false))
            .addStringOption(o => o.setName('tiktok').setDescription('رابط تيك توك').setRequired(false))
            .addStringOption(o => o.setName('twitter').setDescription('رابط تويتر/اكس').setRequired(false))
            .addStringOption(o => o.setName('threads').setDescription('رابط ثريدز').setRequired(false))
            .addStringOption(o => o.setName('snapchat').setDescription('رابط سناب شات').setRequired(false))
            .addStringOption(o => o.setName('banner').setDescription('رابط صورة البانر السفلية').setRequired(false))
            .addBooleanOption(o => o.setName('everyone-ping').setDescription('منشن @everyone عند التنبيه؟').setRequired(false)))
        .addSubcommand(sub => sub.setName('notify-channel')
            .setDescription('ضبط قناة التنبيهات الافتراضية')
            .addChannelOption(o => o.setName('channel').setDescription('قناة التنبيهات').addChannelTypes(ChannelType.GuildText).setRequired(true)))
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

client.once('ready', async () => {
    console.log(`🤖 البوت يعمل بنجاح باسم: ${client.user.tag}`);
    try {
        await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
        console.log('✅ تم تسجيل الأوامر بنجاح!');
    } catch (error) {
        console.error('❌ خطأ في تسجيل الأوامر:', error);
    }
    setInterval(checkAllYoutube, 3 * 60 * 1000);
    client.user.setPresence({ status: 'online', activities: [{ name: '📱 Social Notifier | /setaccounts', type: 3 }] });
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const gid = interaction.guildId;
    if (!gid) return;

    if (interaction.commandName === 'setaccounts') {
        const a = getGuildData(gid);
        const parts = [];
        if (a.youtube) parts.push(`▶️ **YouTube:** ${a.youtube}`);
        if (a.instagram) parts.push(`📸 **Instagram:** ${a.instagram}`);
        if (a.twitch) parts.push(`👾 **Twitch:** ${a.twitch}`);
        if (a.kick) parts.push(`🟩 **Kick:** ${a.kick}`);
        if (a.tiktok) parts.push(`🎵 **TikTok:** ${a.tiktok}`);
        if (a.twitter) parts.push(`✖️ **X / Twitter:** ${a.twitter}`);
        if (a.threads) parts.push(`🌀 **Threads:** ${a.threads}`);
        if (a.snapchat) parts.push(`👻 **Snapchat:** ${a.snapchat}`);

        const socialEmbed = new EmbedBuilder()
            .setTitle('🌟 Social Media Accounts')
            .setColor(0x8A2BE2)
            .setDescription(parts.join('\n\n') || 'ℹ️ لا توجد حسابات مضافة بعد.');
        if (a.bannerUrl) socialEmbed.setImage(a.bannerUrl);

        await interaction.reply({ embeds: [socialEmbed] });
        return;
    }

    if (interaction.commandName === 'config-social') {
        if (!interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ content: '❌ هذا الأمر مخصص للإدارة فقط.', ephemeral: true });
        }
        const sub = interaction.options.getSubcommand(false);
        const a = getGuildData(gid);

        if (sub === 'youtube') {
            const cid = interaction.options.getString('channel-id', true);
            const ch = interaction.options.getChannel('notify-channel', true);
            a.youtubeChannelId = cid;
            a.notifyChannelId = ch.id;
            if (!a.youtube) a.youtube = `https://www.youtube.com/channel/${cid}`;
            saveSocial(SOCIAL);
            return interaction.reply({ content: `✅ تم ربط يوتيوب. القناة: <#${ch.id}> | Channel ID: \`${cid}\``, ephemeral: true });
        }

        if (sub === 'accounts') {
            const yt = interaction.options.getString('youtube');
            const ig = interaction.options.getString('instagram');
            const tw = interaction.options.getString('twitch');
            const kk = interaction.options.getString('kick');
            const tt = interaction.options.getString('tiktok');
            const tx = interaction.options.getString('twitter');
            const th = interaction.options.getString('threads');
            const sn = interaction.options.getString('snapchat');
            const bn = interaction.options.getString('banner');
            const ep = interaction.options.getBoolean('everyone-ping');
            if (yt !== null) a.youtube = yt;
            if (ig !== null) a.instagram = ig;
            if (tw !== null) a.twitch = tw;
            if (kk !== null) a.kick = kk;
            if (tt !== null) a.tiktok = tt;
            if (tx !== null) a.twitter = tx;
            if (th !== null) a.threads = th;
            if (sn !== null) a.snapchat = sn;
            if (bn !== null) a.bannerUrl = bn;
            if (ep !== null) a.everyonePing = ep;
            saveSocial(SOCIAL);
            return interaction.reply({ content: '✅ تم تحديث روابط الحسابات بنجاح! استخدم /setaccounts للمعاينة.', ephemeral: true });
        }

        if (sub === 'notify-channel') {
            const ch = interaction.options.getChannel('channel', true);
            a.notifyChannelId = ch.id;
            saveSocial(SOCIAL);
            return interaction.reply({ content: `✅ قناة التنبيهات أصبحت: <#${ch.id}>`, ephemeral: true });
        }
    }
});

async function checkAllYoutube() {
    for (const [gid, acc] of Object.entries(SOCIAL.accounts)) {
        if (!acc.youtubeChannelId || !acc.notifyChannelId) continue;
        const guild = client.guilds.cache.get(gid);
        if (!guild) continue;
        const channel = guild.channels.cache.get(acc.notifyChannelId);
        if (!channel) continue;
        try {
            const feed = await parser.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${acc.youtubeChannelId}`);
            if (feed.items.length > 0) {
                const latestVideo = feed.items[0];
                const lastSeen = lastYoutubeVideoId[gid] || '';
                if (lastSeen !== latestVideo.id) {
                    if (lastSeen !== '') {
                        const ping = acc.everyonePing ? '@everyone ' : '';
                        const message = `${ping}🎬 **فيديو جديد نزل على YouTube!**\n**العنوان:** ${latestVideo.title}\n${latestVideo.link}`;
                        await channel.send(message).catch(() => {});
                    }
                    lastYoutubeVideoId[gid] = latestVideo.id;
                }
            }
        } catch (err) {
            console.error(`[YouTube Check - ${gid}]`, err.message);
        }
    }
}

const PLATFORM_EMOJI = {
    youtube: '🎬', tiktok: '🎵', instagram: '📸', kick: '🟩',
    twitter: '✖️', x: '✖️', twitch: '👾', snapchat: '👻',
    threads: '🌀', facebook: '📘', telegram: '✈️', other: '🔔'
};
const PLATFORM_NAME = {
    youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', kick: 'Kick',
    twitter: 'X / Twitter', x: 'X / Twitter', twitch: 'Twitch', snapchat: 'Snapchat',
    threads: 'Threads', facebook: 'Facebook', telegram: 'Telegram', other: 'المنصة'
};

app.post('/webhook/notify', async (req, res) => {
    const { platform, title, url, guild_id, channel_id, ping_role, custom_message } = req.body || {};

    if (!url) return res.status(400).send({ status: 'failed', message: 'url is required' });

    let targetChannel = null;
    let guild = null;
    let everyonePing = true;

    if (guild_id && channel_id) {
        guild = client.guilds.cache.get(guild_id);
        if (guild) targetChannel = guild.channels.cache.get(channel_id);
    }

    if (!targetChannel && guild_id && SOCIAL.accounts[guild_id]) {
        const a = SOCIAL.accounts[guild_id];
        guild = client.guilds.cache.get(guild_id);
        if (guild && a.notifyChannelId) targetChannel = guild.channels.cache.get(a.notifyChannelId);
        everyonePing = a.everyonePing !== false;
    }

    if (!targetChannel) {
        for (const [gid, acc] of Object.entries(SOCIAL.accounts)) {
            if (acc.notifyChannelId) {
                const g = client.guilds.cache.get(gid);
                if (g) {
                    const c = g.channels.cache.get(acc.notifyChannelId);
                    if (c) { targetChannel = c; guild = g; everyonePing = acc.everyonePing !== false; break; }
                }
            }
        }
    }

    if (!targetChannel) return res.status(400).send({ status: 'failed', message: 'No configured channel found' });

    try {
        const platKey = (platform || 'other').toLowerCase();
        const emoji = PLATFORM_EMOJI[platKey] || '🔔';
        const platName = PLATFORM_NAME[platKey] || (platform || 'المنصة');
        const videoTitle = title ? `\n**العنوان:** ${title}` : '';
        const pingText = (ping_role ? `<@&${ping_role}> ` : (everyonePing ? '@everyone ' : ''));
        const custom = custom_message ? `\n${custom_message}` : '';

        const message = `${pingText}${emoji} **فيديو/محتوى جديد نزل على ${platName}!**${videoTitle}${custom}\n${url}`;
        await targetChannel.send(message);
        return res.status(200).send({ status: 'success', channel: targetChannel.id });
    } catch (e) {
        console.error('[Webhook Send]', e.message);
        return res.status(500).send({ status: 'failed', message: e.message });
    }
});

app.get('/webhook/health', (req, res) => {
    res.status(200).send({ status: 'ok', bot: client.user?.tag || 'not-ready', guilds: client.guilds.cache.size });
});

app.listen(PORT, () => {
    console.log(`🌐 سيرفر استقبال التنبيهات يعمل على المنفذ: ${PORT}`);
    console.log(`   POST /webhook/notify  → { platform, title, url, guild_id?, channel_id?, ping_role?, custom_message? }`);
    console.log(`   GET  /webhook/health  → Health check`);
});

setInterval(() => saveSocial(SOCIAL), 60_000);
process.on('exit', () => saveSocial(SOCIAL));
process.on('SIGINT', () => { saveSocial(SOCIAL); process.exit(0); });

client.login(TOKEN).catch(e => console.error('❌ فشل تسجيل الدخول:', e.message));

