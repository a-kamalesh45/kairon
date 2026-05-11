const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    available: { type: Number, default: 0 },
    locked: { type: Number, default: 0 }
}, { _id: false });

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 24,
        match: /^[a-z0-9_]+$/,
        index: true
    },
    passwordHash: {
        type: String,
        required: true,
        select: false
    },
    profile: {
        fullName: { type: String, required: true, trim: true, maxlength: 80 },
        organization: { type: String, trim: true, maxlength: 120 },
        role: { type: String, trim: true, maxlength: 80 }
    },
    balances: {
        USDT: { 
            available: { type: Number, default: 100000 },
            locked: { type: Number, default: 0 }
        },
        BTC: { type: balanceSchema, default: () => ({}) },
        ETH: { type: balanceSchema, default: () => ({}) },
        BNB: { type: balanceSchema, default: () => ({}) },
        SOL: { type: balanceSchema, default: () => ({}) },
        DOGE: { type: balanceSchema, default: () => ({}) },
        LINK: { type: balanceSchema, default: () => ({}) },
        XRP: { type: balanceSchema, default: () => ({}) },
        LTC: { type: balanceSchema, default: () => ({}) }
    },
    preferences: {
        baseCurrency: { type: String, default: 'USDT' },
        theme: { type: String, default: 'dark' },
        timezone: { type: String, default: 'UTC' },
        riskMode: { type: String, default: 'standard' },
        orderConfirmations: { type: Boolean, default: true }
    },
    security: {
        mfaEnabled: { type: Boolean, default: false },
        mfaMethods: { type: [String], default: [] },
        failedLoginAttempts: { type: Number, default: 0 },
        lastLoginAt: { type: Date },
        lastLoginIp: { type: String },
        passwordChangedAt: { type: Date, default: () => new Date() }
    },
    sessions: [
        {
            tokenId: { type: String },
            createdAt: { type: Date, default: () => new Date() },
            lastSeenAt: { type: Date },
            ip: { type: String },
            userAgent: { type: String },
            revokedAt: { type: Date }
        }
    ],
    openOrders: [
        {
            symbol: { type: String, trim: true },
            side: { type: String, trim: true },
            type: { type: String, trim: true },
            price: { type: Number },
            qty: { type: Number },
            status: { type: String, default: 'open' },
            createdAt: { type: Date, default: () => new Date() }
        }
    ],
    portfolio: {
        positions: [
            {
                symbol: { type: String, trim: true },
                qty: { type: Number, default: 0 },
                avgEntry: { type: Number, default: 0 },
                unrealizedPnl: { type: Number, default: 0 }
            }
        ],
        lastUpdatedAt: { type: Date }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);