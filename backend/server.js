require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');
const WebSocket = require('ws');
const connectDB = require('./config/db');
const Trade = require('./models/Trade');

// 1. Ignite The Vault (MongoDB)
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// 2. Middleware
app.use(cors());
app.use(express.json()); // Replaces body-parser in modern Express

// 3. Ignite The Nervous System (Redis)
const redisPublisher = createClient({ url: 'redis://127.0.0.1:6379' });
const redisSubscriber = createClient({ url: 'redis://127.0.0.1:6379' });

// Dependency Injection: Make Redis available to all controllers via req.redisPublisher
app.use((req, res, next) => {
    req.redisPublisher = redisPublisher;
    next();
});

// 4. Mount MVC Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/trade', require('./routes/tradeRoutes'));

// 5. Boot Sequence
async function startServer() {
    try {
        await redisPublisher.connect();
        await redisSubscriber.connect();
        console.log('\x1b[36m[REDIS]\x1b[0m Connected to Pub/Sub');

        // Start HTTP API
        const server = app.listen(PORT, () => {
            console.log(`\x1b[32m[GATEWAY]\x1b[0m API Online - Listening on Port ${PORT}`);
        });

        // Start WebSocket Server
        const wss = new WebSocket.Server({ server });

        function broadcast(data) {
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(data));
                }
            });
        }

        // Listen to C++ Engine and Broadcast to Next.js
        // Listen to C++ Engine and Broadcast to Next.js
        await redisSubscriber.subscribe('trade-updates', async (message) => {
            let tradeData = null;

            try {
                tradeData = JSON.parse(message);

                // 🚨 THE FIX: Do not try to save "Sys" messages to the Database!
                if (tradeData.type === 'sys') {
                    console.log(`\x1b[41m\x1b[37m[GATEWAY] System Alert: ${tradeData.msg}\x1b[0m`);
                } else {
                    const parsedTimestamp = tradeData.timestamp ? new Date(tradeData.timestamp) : null;
                    const timestamp = parsedTimestamp && !Number.isNaN(parsedTimestamp.getTime())
                        ? parsedTimestamp
                        : new Date();

                    // Only save actual executions to DB
                    await Trade.create({
                        orderId: String(tradeData.orderId || tradeData.id || `${tradeData.symbol}-${Date.now()}`),
                        user: tradeData.user || undefined,
                        symbol: String(tradeData.symbol || '').toUpperCase(),
                        price: Number(Number(tradeData.price).toFixed(8)),
                        qty: Number(Number(tradeData.qty).toFixed(8)),
                        side: tradeData.side,
                        timestamp
                    });
                }
            } catch (error) {
                console.error('\x1b[31m[TRADE ARCHIVE ERROR]\x1b[0m', error);
            }

            // Always broadcast to WebSockets, even if it's a sys message
            if (tradeData) {
                broadcast(tradeData);
            }
        });
        console.log('\x1b[36m[WEBSOCKET]\x1b[0m Subscribed to C++ Engine feeds');
        
    } catch (err) {
        console.error('\x1b[31m[FATAL BOOT ERROR]\x1b[0m', err);
        process.exit(1);
    }
}

startServer();