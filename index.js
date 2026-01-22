const express = require("express");
const noblox = require("noblox.js");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = process.env.API_KEY;      
const COOKIE = process.env.COOKIE;        
const PORT = process.env.PORT || 3000;

async function startBot() {
    try {
        await noblox.setCookie(COOKIE);
        const currentUser = await noblox.getCurrentUser();
        console.log(`Bot logged in as ${currentUser.UserName}`);
    } catch (err) {
        console.error("Failed to login bot:", err);
        process.exit(1);
    }
}

startBot();

app.post("/rank", async (req, res) => {
    console.log("\n----- NEW REQUEST -----");
    console.log("BODY:", req.body);

    const { key, target, rank, groupId } = req.body;

    if (key !== API_KEY) {
        console.log("Invalid API key");
        return res.status(401).send("Unauthorized");
    }

    if (!target || !rank || !groupId) {
        return res.status(400).send("Missing parameters");
    }

    try {
        const userId = await noblox.getIdFromUsername(target);
        console.log(`User resolved: ${target} → ${userId}`);

        const result = await noblox.setRank(
            Number(groupId),
            userId,
            Number(rank)
        );

        console.log(
            `Ranked ${target} in group ${groupId} to rank ${rank}`
        );

        return res.send("SUCCESS");

    } catch (err) {
        console.error("SERVER ERROR:", err);
        return res.status(500).send("ERROR");
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
