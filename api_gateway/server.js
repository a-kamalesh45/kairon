const express = require('express');
const { createClient } = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');
const WebSocket = require('ws');

const app = express();
const PORT = 3001; 

app.use(cors());
app.use(bodyParser.json());

const redisPublisher = createClient({ url: 'redis://localhost:6379' });
const redisSubscriber = createClient({ url: 'redis://localhost:6379' });

async function startServer() {
    await redisPublisher.connect();
    await redisSubscriber.connect();
    console.log('\x1b[32m[API] Connected to Redis (Pub & Sub)\x1b[0m');

    const server = app.listen(PORT, () => {
        console.log(`\x1b[32m[GATEWAY] Listening on Port ${PORT}\x1b[0m`);
    });

    const wss = new WebSocket.Server({ server });

    function broadcast(data) {
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    await redisSubscriber.subscribe('trade-updates', (message) => {
        try {
            const tradeData = JSON.parse(message);
            
            // Check if it's a System Command (like RESYNC) or a normal trade
            if (tradeData.type === 'sys') {
                console.log(`\x1b[41m\x1b[37m[GATEWAY] System Alert: ${tradeData.msg}\x1b[0m`);
            } else {
                // MUTED: Stop spamming every single Binance trade
                // console.log(`\x1b[35m[GATEWAY] Broadcasting -> ${tradeData.symbol} @ $${tradeData.price}\x1b[0m`);
            }
            broadcast(tradeData);
        } catch (err) {
            console.error("Failed to parse trade-update", err);
        }
    });

    console.log('\x1b[36m[GATEWAY] Subscribed to "trade-updates" channel\x1b[0m');

    app.post('/order', async (req, res) => {
        try {
            const { symbol, price, qty, side } = req.body;
            if (!qty) return res.status(400).json({ error: "Quantity is required" });
            
            let executePrice = price;
            if (!executePrice || executePrice <= 0) {
                executePrice = side === 'buy' ? 999999 : 1; 
            }

            const enginePrice = Math.floor(executePrice * 10000);
            const engineQty = Math.floor(qty * 10000);
            const isBuy = (side === 'buy') ? "1" : "0";
            
            const orderId = Date.now(); 
            
            const payload = `${orderId},${engineQty},${enginePrice},${isBuy},1`;
            
            console.log(`\n\x1b[33m🚨 [UI ORDER] ${side.toUpperCase()} ${qty} ${symbol} @ $${executePrice}\x1b[0m`);

            await redisPublisher.rPush(`orders:${symbol}`, payload);
            res.status(200).json({ success: true, message: 'Order sent to engine', id: orderId });
            
        } catch (err) {
            console.error("[GATEWAY ERROR]", err);
            res.status(500).json({ error: "Internal Server Error" });
        }
    });

    app.post('/resync', async (req, res) => {
        try {
            const { symbol } = req.body;
            console.log(`\x1b[41m\x1b[37m🚨 [UI COMMAND] FORCING REALITY RESYNC ON ${symbol}\x1b[0m`);
            
            await redisPublisher.rPush(`orders:${symbol}`, "RESYNC");
            res.status(200).json({ success: true });
        } catch (err) {
            console.error("[RESYNC ERROR]", err);
            res.status(500).json({ error: "Failed to trigger resync" });
        }
    });
}

startServer();