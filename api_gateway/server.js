const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const redisPublisher = createClient({ url: 'redis://localhost:6379' });
const redisSubscriber = createClient({ url: 'redis://localhost:6379' });

async function startServer() {
    await redisPublisher.connect();
    await redisSubscriber.connect();
    console.log('[API] Connected to Redis (Pub & Sub)');

    // 1. START HTTP SERVER
    const server = app.listen(PORT, () => {
        console.log(`[GATEWAY] Listening on Port ${PORT}`);
    });

    // 2. START WEBSOCKET SERVER
    const wss = new WebSocket.Server({ server });

    function broadcast(data) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    // 3. LISTEN TO REDIS & BROADCAST TO UI
    await redisSubscriber.subscribe('trade-updates', (message) => {
        // We received a trade from mirror_bot.js -> Send it to React
        const tradeData = JSON.parse(message);
        if (tradeData.symbol === 'BTC') { // Filter for the current page
            broadcast(tradeData);
        }
    });

    console.log('[GATEWAY] Subscribed to "trade-updates" channel');

    // 4. ORDER ENDPOINT (For your "Buy" button)
    app.post('/order', async (req, res) => {
        const { symbol, price, qty, side } = req.body;
        const enginePrice = Math.floor(price * 10000);
        const engineQty = Math.floor(qty * 10000);
        const isBuy = (side === 'buy') ? "1" : "0";
        const orderId = 999000000 + Math.floor(Math.random() * 100000);

        await redisPublisher.rPush(`orders:${symbol}`, `${orderId},${engineQty},${enginePrice},${isBuy}`);
        res.json({ status: "success", orderId });
    });
}

startServer();