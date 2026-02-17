const WebSocket = require('ws');
const { createClient } = require('redis');

const REDIS_URL = 'redis://localhost:6379';
const ASSETS = ['btc', 'eth', 'bnb', 'sol', 'doge'];
const streams = ASSETS.map(coin => `${coin}usdt@trade`).join('/');
const BINANCE_WS = `wss://stream.binance.com:443/stream?streams=${streams}`;

async function startBot() {
    console.log(`[BOT] Connecting to Redis...`);
    const publisher = createClient({ url: REDIS_URL });
    publisher.on('error', (err) => console.error('[FATAL] Redis Client Error', err));
    await publisher.connect();
    console.log('[BOT] Redis Connection: SUCCESS');

    const ws = new WebSocket(BINANCE_WS);

    ws.on('open', () => {
        console.log(`[BOT] Connected to Binance! Feeding Engine...`);
    });

    ws.on('message', async (data) => {
        try {
            const msg = JSON.parse(data);
            const tradeData = msg.data;
            const symbol = tradeData.s.replace('USDT', '');
            const price = parseFloat(tradeData.p);
            const qty = parseFloat(tradeData.q);
            
            // "m" = true means Buyer was Maker (Passive). So the Aggressor was a SELLER.
            // If the Aggressor SOLD, it means they hit a BUY LIMIT order.
            // To simulate this liquidity in our engine, we inject the PASSIVE side.
            const isMakerBuy = tradeData.m; 
            
            // Kairon Logic:
            // If trade was a SELL (Taker Sell), we create a BUY LIMIT order.
            // If trade was a BUY (Taker Buy), we create a SELL LIMIT order.
            const side = isMakerBuy ? "1" : "0"; 

            // --- 1. DISABLE DIRECT UI PUBLISHING (Engine handles this now) ---
            // const uiPayload = JSON.stringify({ ... });
            // await publisher.publish('trade-updates', uiPayload); 
            // ----------------------------------------------------------------

            // --- 2. PUSH LIQUIDITY TO ENGINE ---
            const enginePrice = Math.floor(price * 10000);
            const engineQty = Math.floor(qty * 10000);
            
            // Payload: ID, QTY, PRICE, TYPE
            const payload = `${tradeData.t},${engineQty},${enginePrice},${side}`;
            
            if(symbol === 'BTC') {
                await publisher.rPush(`orders:${symbol}`, payload);
            }

        } catch (err) {
            console.error(`[ERROR] Processing Message: ${err.message}`);
        }
    });
}

startBot();