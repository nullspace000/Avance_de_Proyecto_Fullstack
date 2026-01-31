const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static create(data) {
        return new Promise(async (resolve, reject) => {
            try {
                const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const hashedPassword = await bcrypt.hash(data.password, 10);
                
                const sql = `
                    INSERT INTO users (id, username, email, password_hash, display_name)
                    VALUES (?, ?, ?, ?, ?)
                `;
                
                db.run(sql, [id, data.username, data.email, hashedPassword, data.display_name || data.username], 
                    function(err) {
                        if (err) reject(err);
                        else resolve({ id, username: data.username, email: data.email, display_name: data.display_name || data.username });
                    });
            } catch (err) {
                reject(err);
            }
        });
    }

    static findByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE username = ?';
            db.get(sql, [username], (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }

    static findByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM users WHERE email = ?';
            db.get(sql, [email], (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id, username, email, display_name, avatar_url, created_at FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row || null);
            });
        });
    }

    static validatePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    static update(id, data) {
        return new Promise(async (resolve, reject) => {
            const fields = [];
            const values = [];

            if (data.display_name) {
                fields.push('display_name = ?');
                values.push(data.display_name);
            }

            if (data.avatar_url) {
                fields.push('avatar_url = ?');
                values.push(data.avatar_url);
            }

            if (data.settings) {
                fields.push('settings = ?');
                values.push(JSON.stringify(data.settings));
            }

            if (data.password) {
                fields.push('password_hash = ?');
                values.push(await bcrypt.hash(data.password, 10));
            }

            if (fields.length === 0) {
                return resolve(null);
            }

            fields.push('updated_at = CURRENT_TIMESTAMP');
            values.push(id);

            const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
            
            db.run(sql, values, function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    static delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM users WHERE id = ?';
            db.run(sql, [id], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }
}

module.exports = User;
