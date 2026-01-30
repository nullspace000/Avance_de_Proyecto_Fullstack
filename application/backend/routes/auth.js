/**
 * Authentication Routes
 * Simplified version - allows demo access without login
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Demo user ID for testing without login
const DEMO_USER_ID = 'demo-user-001';

function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Public: Register
router.post('/register', async (req, res) => {
    const { getDb } = require('../config/database');
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) {
            return res.status(400).json({ success: false, error: 'Username, email, and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
        }

        const db = getDb();
        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);

        const existing = await new Promise((resolve) => {
            db.get('SELECT id FROM users WHERE username = ? OR email = ?', [username, email], (err, row) => {
                resolve(row);
            });
        });

        if (existing) {
            return res.status(409).json({ success: false, error: 'Username or email already exists' });
        }

        await new Promise((resolve, reject) => {
            db.run('INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
                [id, username, email, passwordHash], function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
        });

        const user = { id, username, email };
        const token = generateToken(user);

        res.status(201).json({ success: true, data: { user, token } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Public: Login
router.post('/login', async (req, res) => {
    const { getDb } = require('../config/database');
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }

        const db = getDb();
        const user = await new Promise((resolve) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => resolve(row));
        });

        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        const { password_hash, ...userWithoutPassword } = user;
        const token = generateToken(userWithoutPassword);

        res.json({ success: true, data: { user: userWithoutPassword, token } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Demo: Login without password (for testing)
router.post('/demo-login', (req, res) => {
    const demoUser = {
        id: DEMO_USER_ID,
        username: 'demo',
        email: 'demo@example.com'
    };
    const token = generateToken(demoUser);
    res.json({ success: true, data: { user: demoUser, token } });
});

// Protected: Get Profile
router.get('/me', async (req, res) => {
    const { getDb } = require('../config/database');
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const db = getDb();
        const user = await new Promise((resolve) => {
            db.get('SELECT id, username, email, avatar_url, created_at, updated_at FROM users WHERE id = ?',
                [decoded.id], (err, row) => resolve(row));
        });

        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Protected: Update Profile
router.put('/me', async (req, res) => {
    const { getDb } = require('../config/database');
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const { username, email, avatar_url } = req.body;
        const db = getDb();

        await new Promise((resolve, reject) => {
            db.run('UPDATE users SET username = ?, email = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [username, email, avatar_url, decoded.id], function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
        });

        const user = await new Promise((resolve) => {
            db.get('SELECT id, username, email, avatar_url, created_at, updated_at FROM users WHERE id = ?',
                [decoded.id], (err, row) => resolve(row));
        });

        res.json({ success: true, data: user });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/logout', (req, res) => {
    res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
