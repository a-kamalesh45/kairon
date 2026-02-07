const WebSocket = require('ws');
const { createClient } = require('redis');

const REDIS_URL = 'redis://localhost:6379';
const ASSETS = ['btc']; // Focusing on BTC for now
const streams = ASSETS.map(coin => `${coin}usdt@trade`).join('/');
const BINANCE_WS = `wss://stream.binance.com:443/stream?streams=${streams}`;

async function startBot() {
    const publisher = createClient({ url: REDIS_URL });
    await publisher.connect();
    console.log('[BOT] Connected. Feeding Liquidity to Engine...');

    const ws = new WebSocket(BINANCE_WS);

    ws.on('message', async (data) => {
        try {
            const msg = JSON.parse(data);
            const trade = msg.data;
            const symbol = trade.s.replace('USDT', '');
            const price = parseFloat(trade.p);
            const qty = parseFloat(trade.q);

            // --- LOGIC CHANGE ---
            // If Binance trade m=true (Buyer was Maker), it means the Taker SOLD.
            // This implies there is BUY LIQUIDITY at this price.
            // So we inject a LIMIT BUY order into our engine.
            const isBuyLiquidity = trade.m; 
            const side = isBuyLiquidity ? "1" : "0"; 

            const enginePrice = Math.floor(price * 10000);
            const engineQty = Math.floor(qty * 10000); 

            // Payload: ID, Qty, Price, Type (1=Buy, 0=Sell)
            const payload = `${trade.t},${engineQty},${enginePrice},${side}`;
            
            if(symbol === 'BTC') {
                await publisher.rPush(`orders:${symbol}`, payload);
            }

        } catch (err) { console.error(err); }
    });
}

startBot();