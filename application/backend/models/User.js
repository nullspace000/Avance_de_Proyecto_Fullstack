/**
 * User Model
 * Handles user-related database operations
 */

const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { getDb } = require('../config/database');

class UserModel {
    /**
     * Create a new user
     * @param {Object} userData - User data
     * @returns {Promise<Object>} Created user
     */
    static async create(userData) {
        const db = getDb();
        const { username, email, password } = userData;
        const id = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (id, username, email, password_hash)
                         VALUES (?, ?, ?, ?)`;

            db.run(sql, [id, username, email, passwordHash], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint')) {
                        reject(new Error('Username or email already exists'));
                        return;
                    }
                    reject(err);
                    return;
                }

                resolve({
                    id,
                    username,
                    email,
                    created_at: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Find user by ID
     * @param {string} id - User ID
     * @returns {Promise<Object|null>} User or null
     */
    static async findById(id) {
        const db = getDb();

        return new Promise((resolve, reject) => {
            db.get('SELECT id, username, email, avatar_url, created_at, updated_at FROM users WHERE id = ?',
                [id], (err, row) => {
                    if (err) reject(err);
                    resolve(row || null);
                });
        });
    }

    /**
     * Find user by username
     * @param {string} username - Username
     * @returns {Promise<Object|null>} User or null
     */
    static async findByUsername(username) {
        const db = getDb();

        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) reject(err);
                resolve(row || null);
            });
        });
    }

    /**
     * Find user by email
     * @param {string} email - Email
     * @returns {Promise<Object|null>} User or null
     */
    static async findByEmail(email) {
        const db = getDb();

        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
                if (err) reject(err);
                resolve(row || null);
            });
        });
    }

    /**
     * Validate user credentials
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {Promise<Object|null>} User or null if invalid
     */
    static async validateCredentials(username, password) {
        const db = getDb();

        return new Promise(async (resolve, reject) => {
            try {
                const user = await this.findByUsername(username);
                if (!user) {
                    resolve(null);
                    return;
                }

                const isValid = await bcrypt.compare(password, user.password_hash);
                if (!isValid) {
                    resolve(null);
                    return;
                }

                // Return user without password hash
                const { password_hash, ...userWithoutPassword } = user;
                resolve(userWithoutPassword);
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Update user profile
     * @param {string} id - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated user
     */
    static async update(id, updates) {
        const db = getDb();
        const allowedFields = ['username', 'email', 'avatar_url'];
        const setClauses = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            if (allowedFields.includes(snakeKey)) {
                setClauses.push(`${snakeKey} = ?`);
                values.push(value);
            }
        }

        if (setClauses.length === 0) {
            return this.findById(id);
        }

        setClauses.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id);

        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET ${setClauses.join(', ')} WHERE id = ?`;

            db.run(sql, values, function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint')) {
                        reject(new Error('Username or email already exists'));
                        return;
                    }
                    reject(err);
                    return;
                }

                resolve(this.changes > 0 ? this.findById(id) : null);
            });
        });
    }

    /**
     * Delete user account
     * @param {string} id - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async delete(id) {
        const db = getDb();

        return new Promise((resolve, reject) => {
            db.run('DELETE FROM users WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                resolve(this.changes > 0);
            });
        });
    }
}

module.exports = UserModel;
