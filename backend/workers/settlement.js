const mongoose = require('mongoose');
const { createClient } = require('redis');
const User = require('../models/User'); // Path to your User model
const connectDB = require('../config/db'); // Path to your DB connection logic

// Initialize Redis Subscriber
const redisSubscriber = createClient({ url: 'redis://localhost:6379' });

async function startClearingHouse() {
    // 1. Connect to Database and Redis
    await connectDB();
    await redisSubscriber.connect();

    console.log("\x1b[32m[CLEARING HOUSE] Online & listening for settled trades...\x1b[0m");

    // 2. Subscribe to the C++ Engine's output channel
    await redisSubscriber.subscribe('trade-updates', async (message) => {
        try {
            // ... inside redisSubscriber.subscribe callback ...

            const trade = JSON.parse(message);

            // 🚀 THE FIX: Use the actual userId provided by the C++ engine
            if (trade.user) {
                console.log(`\x1b[33m[SETTLEMENT] Processing for User: ${trade.user}\x1b[0m`);

                // Use findById instead of findOne
                const user = await User.findById(trade.user);
                if (!user) {
                    console.error(`\x1b[31m[SETTLEMENT ERROR] User ${trade.user} not found!\x1b[0m`);
                    return;
                }

                // Now update balances using the correct user object
                const cost = trade.qty * trade.price;
                const assetSymbol = trade.symbol.toUpperCase();

                // Ensure balances exist
                if (!user.balances) user.balances = { USDT: 10000 };

                if (trade.side === 'buy') {
                    user.balances.USDT = (user.balances.USDT || 0) - cost;
                    user.balances[assetSymbol] = (user.balances[assetSymbol] || 0) + trade.qty;
                } else {
                    user.balances.USDT = (user.balances.USDT || 0) + cost;
                    user.balances[assetSymbol] = (user.balances[assetSymbol] || 0) - trade.qty;
                }

                await user.save();
                console.log(`\x1b[32m[SETTLEMENT SUCCESS] Wallet for ${user.email} updated.\x1b[0m`);
            }
        } catch (err) {
            console.error("[SETTLEMENT ERROR]", err);
        }
    });
}

startClearingHouse();