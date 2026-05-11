const User = require('../models/User');

const toSafeNumber = (value, precision = 8) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? Number(parsed.toFixed(precision)) : NaN;
};

// @route   POST /api/trade/order
// @access  Private (Requires JWT)
exports.placeOrder = async (req, res) => {
    try {
        const { symbol, price, qty, side } = req.body;

        const normalizedSymbol = String(symbol || '').toUpperCase();
        const normalizedSide = String(side || '').toLowerCase();
        const normalizedQty = toSafeNumber(qty);
        
        // 1. Identity Verification (From JWT Middleware)
        const user = req.user; 

        if (!normalizedSymbol || !['buy', 'sell'].includes(normalizedSide) || !Number.isFinite(normalizedQty) || normalizedQty <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid order payload' });
        }

        let executePrice = Number(price);
        if (!Number.isFinite(executePrice) || executePrice <= 0) {
            executePrice = normalizedSide === 'buy' ? 999999 : 1; // Market order simulation
        }

        const normalizedPrice = toSafeNumber(executePrice);
        if (!Number.isFinite(normalizedPrice) || normalizedPrice <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid price' });
        }

        const baseAsset = normalizedSymbol.endsWith('USDT')
            ? normalizedSymbol.replace(/USDT$/, '')
            : normalizedSymbol;
        const balanceAsset = normalizedSide === 'buy' ? 'USDT' : baseAsset;
        const cost = normalizedSide === 'buy'
            ? toSafeNumber(normalizedPrice * normalizedQty)
            : normalizedQty;

        if (!balanceAsset || !Number.isFinite(cost) || cost <= 0) {
            return res.status(400).json({ success: false, error: 'Invalid balance calculation' });
        }

        const availablePath = `balances.${balanceAsset}.available`;
        const lockedPath = `balances.${balanceAsset}.locked`;

        const lockedUser = await User.findOneAndUpdate(
            {
                _id: user._id,
                [availablePath]: { $gte: cost }
            },
            {
                $inc: {
                    [availablePath]: -cost,
                    [lockedPath]: cost
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!lockedUser) {
            return res.status(400).json({ success: false, error: 'Insufficient Funds' });
        }
        
        // 2. Format for C++ Engine
        const enginePrice = Math.floor(normalizedPrice * 10000);
        const engineQty = Math.floor(normalizedQty * 10000);
        const isBuy = normalizedSide === 'buy' ? '1' : '0';

        const orderId = String(Date.now()); 
        // Note: We will eventually add User ID to this payload so C++ knows who traded
        const payload = `${orderId},${engineQty},${enginePrice},${isBuy}`;
        
        // 3. Push to Redis (req.redisPublisher is injected via server.js)
        await req.redisPublisher.rPush(`orders:${normalizedSymbol}`, payload);
        
        const logColor = normalizedSide === 'buy' ? '\x1b[32m' : '\x1b[31m';
        console.log(`${logColor}🚨 [ORDER RECEIVED] User ${user.email} -> ${normalizedSide.toUpperCase()} ${normalizedQty} ${normalizedSymbol} @ $${normalizedPrice}\x1b[0m`);

        res.status(200).json({ success: true, message: 'Order sent to engine', id: orderId });

    } catch (error) {
        console.error("\x1b[31m[TRADE ERROR]\x1b[0m", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};