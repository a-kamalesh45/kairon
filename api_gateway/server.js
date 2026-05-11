const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
// TWEAK 1: Changed to 3001 to avoid colliding with Next.js frontend
const PORT = 3001; 

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
    // ✅ New Code: Broadcast all market events. 
    // (The React frontend already filters what to display via `if (wsData.symbol === selectedCrypto.symbol)`)
    await redisSubscriber.subscribe('trade-updates', (message) => {
        const tradeData = JSON.parse(message);
        broadcast(tradeData);
    });

    console.log('[GATEWAY] Subscribed to "trade-updates" channel');

    // 4. ORDER ENDPOINT (For your "Buy" button)
    app.post('/order', async (req, res) => {
        try {
            const { symbol, price, qty, side } = req.body;
            
            // TWEAK 2: Safety check for missing data or Market Orders
            if (!qty) return res.status(400).json({ error: "Quantity is required" });
            
            // If no price is provided, simulate a Market Order by setting an extreme limit price
            // A buyer is willing to pay up to $999,999. A seller will take as low as $1.
            let executePrice = price;
            if (!executePrice || executePrice <= 0) {
                executePrice = side === 'buy' ? 999999 : 1; 
            }

            const enginePrice = Math.floor(executePrice * 10000);
            const engineQty = Math.floor(qty * 10000);
            const isBuy = (side === 'buy') ? "1" : "0";
            
            const orderId = Date.now(); 
            const payload = `${orderId},${engineQty},${enginePrice},${isBuy}`;
            
            // --- NEW: WHALE ALERT LOGGING ---
            const logColor = side === 'buy' ? '\x1b[32m' : '\x1b[31m'; // Green or Red
            const resetColor = '\x1b[0m';
            console.log(`\n${logColor}🚨 [WHALE ORDER] ${side.toUpperCase()} ${qty} ${symbol} @ $${executePrice}${resetColor}`);
            console.log(`Routing to C++ Engine -> Payload: [${payload}]\n`);
            // --------------------------------

            await redisPublisher.rPush(`orders:${symbol}`, payload);
            res.status(200).json({ success: true, message: 'Order sent to engine', id: orderId });
            
        } catch (err) {
            console.error("[GATEWAY ERROR]", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });
}

startServer();