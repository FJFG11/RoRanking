require("dotenv").config();
const express = require("express");
const noblox = require("noblox.js");
const cors = require("cors");

const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require("discord.js");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.API_KEY;
const GROUP_ID = 753140944;
const COOKIE = process.env.COOKIE;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const PORT = 3000;

/* ---------------- ROBLOX LOGIN ---------------- */
(async () => {
    try {
        await noblox.setCookie(COOKIE);
        console.log("✅ Roblox bot logged in");
    } catch (err) {
        console.error("❌ Roblox login failed:", err);
        process.exit(1);
    }
})();

/* ---------------- EXPRESS API ---------------- */
app.post("/rank", async (req, res) => {
    if (req.body.key !== API_KEY) return res.status(401).send("Unauthorized");

    const { target, rank } = req.body;
    if (!target || !rank) return res.status(400).send("Bad Request");

    try {
        const userId = await noblox.getIdFromUsername(target);
        await noblox.setRank(GROUP_ID, userId, rank);
        res.send("SUCCESS");
    } catch (err) {
        console.error(err);
        res.status(500).send("ERROR");
    }
});

app.listen(PORT, () => console.log(`🚀 API running on ${PORT}`));

/* ---------------- DISCORD BOT ---------------- */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const command = new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Rank a Roblox user")
    .addStringOption(o =>
        o.setName("username").setDescription("Roblox username").setRequired(true)
    )
    .addIntegerOption(o =>
        o.setName("rank").setDescription("Group rank ID").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

const rest = new REST({ version: "10" }).setToken(DISCORD_TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: [command.toJSON()] }
        );
        console.log("✅ Slash command registered");
    } catch (err) {
        console.error("❌ Slash command failed:", err);
    }
})();

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== "rank") return;

    const username = interaction.options.getString("username");
    const rank = interaction.options.getInteger("rank");

    await interaction.deferReply({ ephemeral: true });

    try {
        const res = await fetch(`http://localhost:${PORT}/rank`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                key: API_KEY,
                target: username,
                rank
            })
        });

        if (!res.ok) throw new Error(await res.text());

        await interaction.editReply(`✅ **${username}** ranked to **${rank}**`);
    } catch (err) {
        await interaction.editReply(`❌ Error: ${err.message}`);
    }
});

client.login(DISCORD_TOKEN);
