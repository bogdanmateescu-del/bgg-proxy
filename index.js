const express = require('express');
const cors = require('cors');

const app = express();

// 1. Open CORS specifically for your Vercel app
app.use(cors({
  origin: 'https://board-game-trove.vercel.app'
}));

// 2. Create the BGG endpoint
app.get('/api/bgg', async (req, res) => {
    const { endpoint, query, id } = req.query;

    // Build the BGG URL
    let bggUrl = `https://boardgamegeek.com/xmlapi2/${endpoint}?`;
    if (endpoint === 'search' && query) {
        bggUrl += `type=boardgame,boardgameexpansion&query=${encodeURIComponent(query)}`;
    } else if (endpoint === 'thing' && id) {
        bggUrl += `id=${id}`;
    } else {
        return res.status(400).send("Invalid parameters");
    }

    try {
        // 3. Fetch from BGG with an honest User-Agent
        const response = await fetch(bggUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'BoardGameTrove-Proxy/1.0',
                'Accept': 'text/xml'
            }
        });

        const data = await response.text();

        if (!response.ok) {
            return res.status(response.status).send(`BGG Error: ${response.status}`);
        }

        // 4. Send the XML back to your frontend
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        res.send(data);
    } catch (error) {
        res.status(500).send(`Server Error: ${error.message}`);
    }
});

// 5. Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Proxy listening on port ${PORT}`);
});
