const express = require("express");
const noblox = require("noblox.js");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.API_KEY;
const GROUP_ID = Number(753140944);
const COOKIE = process.env.COOKIE;

// Start the bot
async function startBot() {
    try {
        await noblox.setCookie(COOKIE);
        console.log("Bot logged into Roblox.");
    } catch (err) {
        console.error("Failed to login bot:", err);
    }
}

startBot();


// ---- RANKING ENDPOINT ----
app.post("/rank", async (req, res) => {
    console.log("\n----- NEW REQUEST -----");
    console.log("BODY:", req.body);

    if (req.body.key !== API_KEY) {
        console.log("❌ Incorrect API Key:", req.body.key);
        return res.status(401).send("Unauthorized");
    }

    const { target, rank } = req.body;
    console.log(`Processing rank request → ${target} → ${rank}`);

    try {
        // Convert username → ID
        const userId = await noblox.getIdFromUsername(target);
        console.log("Found UserId:", userId);

        // Attempt rank set
        const result = await noblox.setRank(GROUP_ID, userId, rank);
        console.log("Rank updated successfully:", result);

        return res.send("SUCCESS");

    } catch (err) {
        console.error("❌ SERVER ERROR:", err);
        return res.status(500).send("ERROR");
    }
});


// ---- START SERVER ----
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
