const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/constants');

const userController = {
    async register(req, res) {
        try {
            const { username, email, password, display_name } = req.body;

            if (!username || !email || !password) {
                return res.status(400).json({ 
                    error: 'Username, email, and password are required' 
                });
            }

            // Check if user already exists
            const existingUser = await User.findByUsername(username);
            if (existingUser) {
                return res.status(409).json({ error: 'Username already exists' });
            }

            const existingEmail = await User.findByEmail(email);
            if (existingEmail) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            const user = await User.create({ 
                username, 
                email, 
                password, 
                display_name 
            });

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name
                },
                token
            });
        } catch (err) {
            console.error('Registration error:', err);
            res.status(500).json({ error: 'Registration failed' });
        }
    },

    async login(req, res) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ 
                    error: 'Username and password are required' 
                });
            }

            const user = await User.findByUsername(username);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const isValid = await User.validatePassword(password, user.password_hash);
            if (!isValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username },
                JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url,
                    settings: user.settings ? JSON.parse(user.settings) : null
                },
                token
            });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Login failed' });
        }
    },

    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url,
                    settings: user.settings ? JSON.parse(user.settings) : null,
                    created_at: user.created_at
                }
            });
        } catch (err) {
            console.error('Get profile error:', err);
            res.status(500).json({ error: 'Failed to get profile' });
        }
    },

    async updateProfile(req, res) {
        try {
            const { display_name, avatar_url, password, settings } = req.body;
            
            const updateData = {};
            if (display_name) updateData.display_name = display_name;
            if (avatar_url) updateData.avatar_url = avatar_url;
            if (password) updateData.password = password;
            if (settings) updateData.settings = settings;

            const success = await User.update(req.user.userId, updateData);
            
            if (!success) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'Profile updated successfully' });
        } catch (err) {
            console.error('Update profile error:', err);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    },

    async deleteAccount(req, res) {
        try {
            const success = await User.delete(req.user.userId);
            
            if (!success) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'Account deleted successfully' });
        } catch (err) {
            console.error('Delete account error:', err);
            res.status(500).json({ error: 'Failed to delete account' });
        }
    },

    logout(req, res) {
        // In a stateless JWT setup, logout is typically handled client-side
        // by removing the token from storage.
        // This endpoint can be used for logging purposes or token blacklisting.
        res.json({ message: 'Logged out successfully' });
    },

    async getCurrentUser(req, res) {
        try {
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    display_name: user.display_name,
                    avatar_url: user.avatar_url,
                    settings: user.settings ? JSON.parse(user.settings) : null,
                    created_at: user.created_at
                }
            });
        } catch (err) {
            console.error('Get current user error:', err);
            res.status(500).json({ error: 'Failed to get current user' });
        }
    }
};

module.exports = userController;
