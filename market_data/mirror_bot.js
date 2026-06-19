const WebSocket = require('ws');
const { createClient } = require('redis');

const REDIS_URL = 'redis://localhost:6379';
const ASSETS = ['btc', 'eth', 'bnb', 'sol', 'doge', 'link', 'xrp', 'ltc'];
const streams = ASSETS.map(coin => `${coin}usdt@trade`).join('/');
const BINANCE_WS = `wss://stream.binance.com:443/stream?streams=${streams}`;

let tradeCounter = 0; // Heartbeat counter

async function startBot() {
    console.log(`\x1b[36m[BOT] Connecting to Redis...\x1b[0m`);
    const publisher = createClient({ url: REDIS_URL });
    publisher.on('error', (err) => console.error('\x1b[31m[FATAL] Redis Client Error\x1b[0m', err));
    await publisher.connect();
    console.log('\x1b[32m[BOT] Redis Connection: SUCCESS\x1b[0m');

    const ws = new WebSocket(BINANCE_WS);

    ws.on('open', () => {
        console.log(`\x1b[32m[BOT] Connected to Binance! Listening to 8 streams...\x1b[0m`);
    });

    ws.on('error', (err) => {
        console.error(`\x1b[31m[BOT] WebSocket Error (Binance might be blocking you):\x1b[0m`, err);
    });

    ws.on('message', async (data) => {
        try {
            const msg = JSON.parse(data);
            if (!msg.data) return; // Skip connection success messages

            const tradeData = msg.data;
            const symbol = tradeData.s.replace('USDT', '');
            const price = parseFloat(tradeData.p);
            const qty = parseFloat(tradeData.q);
            
            const isMakerBuy = tradeData.m; 
            const side = isMakerBuy ? "1" : "0"; 

            const enginePrice = Math.floor(price * 10000);
            const engineQty = Math.floor(qty * 10000);
            const payload = `${tradeData.E},${engineQty},${enginePrice},${side}`;
            
            // PUSH EVERYTHING TO REDIS (No more BTC hardcode!)
            await publisher.rPush(`orders:${symbol}`, payload);

            // HEARTBEAT LOG (Prints every 100th trade)
            tradeCounter++;
            if (tradeCounter % 100 === 0) {
                console.log(`\x1b[90m[BOT HEARTBEAT] Pushed 100 trades. Last: ${symbol} @ $${price}\x1b[0m`);
            }

        } catch (err) {
            console.error(`\x1b[31m[ERROR] Processing Message:\x1b[0m`, err.message);
        }
    });
}

startBot();