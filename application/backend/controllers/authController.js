/**
 * Authentication Controller
 * Handles user authentication operations
 */

const jwt = require('jsonwebtoken');
const { UserModel } = require('../models');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token for user
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
}

/**
 * Register new user
 * POST /api/auth/register
 */
async function register(req, res) {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username, email, and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters'
            });
        }

        // Create user
        const user = await UserModel.create({ username, email, password });
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            }
        });
    } catch (err) {
        if (err.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                error: err.message
            });
        }
        console.error('Registration error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Login user
 * POST /api/auth/login
 */
async function login(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'Username and password are required'
            });
        }

        const user = await UserModel.validateCredentials(username, password);

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        const token = generateToken(user);

        res.json({
            success: true,
            data: {
                user,
                token
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Get current user profile
 * GET /api/auth/me
 */
async function getProfile(req, res) {
    try {
        const user = await UserModel.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Update user profile
 * PUT /api/auth/me
 */
async function updateProfile(req, res) {
    try {
        const { username, email, avatar_url } = req.body;

        const updatedUser = await UserModel.update(req.user.id, {
            username,
            email,
            avatarUrl: avatar_url
        });

        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: updatedUser
        });
    } catch (err) {
        if (err.message.includes('already exists')) {
            return res.status(409).json({
                success: false,
                error: err.message
            });
        }
        console.error('Update profile error:', err);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
}

/**
 * Logout (client-side token removal)
 * POST /api/auth/logout
 */
async function logout(req, res) {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    logout,
    generateToken
};
