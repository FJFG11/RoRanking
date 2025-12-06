require("dotenv").config();
const express = require("express");
const noblox = require("noblox.js");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.API_KEY;
const COOKIE = process.env.COOKIE;
const GROUP_ID = 753140944; // or process.env.GROUP_ID

async function startBot() {
    try {
        await noblox.setCookie(COOKIE);
        console.log("Bot logged into Roblox.");
    } catch (err) {
        console.error("Bot login failed:", err);
    }
}
startBot();

app.post("/rank", async (req, res) => {
    if (req.body.key !== API_KEY) return res.status(401).send("Unauthorized");

    const { target, rank } = req.body;

    try {
        const userId = await noblox.getIdFromUsername(target);
        await noblox.setRank(GROUP_ID, userId, rank);
        return res.send("SUCCESS");
    } catch (err) {
        console.error("❌ SERVER ERROR:", err);
        return res.status(500).send("ERROR");
    }
});

app.listen(3000, () => console.log("Server running on port 3000"));
