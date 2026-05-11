const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-z0-9_]{3,24}$/;
const MIN_PASSWORD_LENGTH = 10;

const normalizeString = (value) => String(value || '').trim();
const normalizeEmail = (value) => normalizeString(value).toLowerCase();
const normalizeUsername = (value) => normalizeString(value).toLowerCase();

const createSessionId = () => crypto.randomBytes(16).toString('hex');

// Helper function to generate the session token
const generateToken = (id, sessionId) => {
    return jwt.sign({ id, sid: sessionId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @route   POST /api/auth/register
exports.registerUser = async (req, res) => {
    try {
        const { email, password, username, fullName } = req.body;

        const normalizedEmail = normalizeEmail(email);
        const normalizedUsername = normalizeUsername(username);
        const normalizedFullName = normalizeString(fullName);

        if (!normalizedEmail || !normalizedUsername || !normalizedFullName || !password) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        if (!EMAIL_REGEX.test(normalizedEmail)) {
            return res.status(400).json({ success: false, error: 'Invalid email format' });
        }

        if (!USERNAME_REGEX.test(normalizedUsername)) {
            return res.status(400).json({ success: false, error: 'Username must be 3-24 characters (a-z, 0-9, _)' });
        }

        if (String(password).length < MIN_PASSWORD_LENGTH) {
            return res.status(400).json({ success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
        }

        // 1. Check if user already exists
        const userExists = await User.findOne({
            $or: [{ email: normalizedEmail }, { username: normalizedUsername }]
        });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'Account already exists' });
        }

        // 2. Hash the password (Never store plain text!)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(String(password), salt);

        // 3. Create the user (This automatically triggers the $100k USDT default from the Schema)
        const sessionId = createSessionId();

        const user = await User.create({
            email: normalizedEmail,
            username: normalizedUsername,
            passwordHash: hashedPassword,
            profile: {
                fullName: normalizedFullName
            },
            sessions: [
                {
                    tokenId: sessionId,
                    ip: req.ip,
                    userAgent: req.get('user-agent') || 'unknown'
                }
            ]
        });

        // 4. Send back the token and wallet data
        res.status(201).json({
            success: true,
            token: generateToken(user._id, sessionId),
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                fullName: user.profile?.fullName || '',
                balances: user.balances
            }
        });

    } catch (error) {
        console.error("\x1b[31m[AUTH ERROR]\x1b[0m", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};

// @route   POST /api/auth/login
exports.loginUser = async (req, res) => {
    try {
        const { identifier, email, username, password } = req.body;

        const rawIdentifier = identifier || email || username;
        const normalizedIdentifier = normalizeString(rawIdentifier).toLowerCase();

        if (!normalizedIdentifier || !password) {
            return res.status(400).json({ success: false, error: 'Missing credentials' });
        }

        // 1. Find the user
        const user = await User.findOne({
            $or: [{ email: normalizedIdentifier }, { username: normalizedIdentifier }]
        }).select('+passwordHash');
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // 2. Check the password
        const isMatch = await bcrypt.compare(String(password), user.passwordHash);
        if (!isMatch) {
            await User.updateOne(
                { _id: user._id },
                { $inc: { 'security.failedLoginAttempts': 1 } }
            );
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const sessionId = createSessionId();

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    'security.failedLoginAttempts': 0,
                    'security.lastLoginAt': new Date(),
                    'security.lastLoginIp': req.ip
                },
                $push: {
                    sessions: {
                        tokenId: sessionId,
                        ip: req.ip,
                        userAgent: req.get('user-agent') || 'unknown'
                    }
                }
            }
        );

        // 3. Send back the token
        res.status(200).json({
            success: true,
            token: generateToken(user._id, sessionId),
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                fullName: user.profile?.fullName || '',
                balances: user.balances
            }
        });

    } catch (error) {
        console.error("\x1b[31m[AUTH ERROR]\x1b[0m", error);
        res.status(500).json({ success: false, error: 'Server Error' });
    }
};