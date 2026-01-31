const db = require('../config/database');

// Map media_type_id to media_type string
const mediaTypeMap = {
    1: 'movie',
    2: 'series',
    3: 'game'
};

class MediaItem {
    static create(data) {
        return new Promise((resolve, reject) => {
            const id = `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const mediaTypeId = data.media_type_id || 1;
            const mediaType = mediaTypeMap[mediaTypeId] || 'movie';
            
            const sql = `
                INSERT INTO media_items (id, user_id, media_type_id, title, status, rating, reason, poster_url)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const params = [
                id, 
                data.user_id, 
                mediaTypeId, 
                data.title,
                data.status || 'watchlist',
                data.rating || null,
                data.reason || null,
                data.poster_url || null
            ];
            
            db.run(sql, params, function(err) {
                if (err) reject(err);
                else resolve({ 
                    id, 
                    title: data.title, 
                    media_type: mediaType,
                    status: data.status || 'watchlist',
                    rating: data.rating || null,
                    reason: data.reason || null
                });
            });
        });
    }

    static findByUser(userId, options = {}) {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT m.*, mt.name as media_type_name, mt.icon as media_type_icon
                FROM media_items m
                LEFT JOIN media_types mt ON m.media_type_id = mt.id
                WHERE m.user_id = ?
            `;
            const params = [userId];

            // Filter by status (watchlist or seen)
            if (options.status) {
                sql += ' AND m.status = ?';
                params.push(options.status);
            }

            if (options.mediaTypeId) {
                sql += ' AND m.media_type_id = ?';
                params.push(options.mediaTypeId);
            }

            if (options.search) {
                sql += ' AND (m.title LIKE ? OR m.original_title LIKE ?)';
                params.push(`%${options.search}%`, `%${options.search}%`);
            }

            sql += ' ORDER BY m.created_at DESC';

            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else {
                    const mappedRows = (rows || []).map(row => ({
                        ...row,
                        media_type: row.media_type || mediaTypeMap[row.media_type_id] || 'movie'
                    }));
                    resolve(mappedRows);
                }
            });
        });
    }

    static findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT m.*, mt.name as media_type_name, mt.icon as media_type_icon
                FROM media_items m
                LEFT JOIN media_types mt ON m.media_type_id = mt.id
                WHERE m.id = ?
            `;
            db.get(sql, [id], (err, row) => {
                if (err) reject(err);
                else if (row) {
                    resolve({
                        ...row,
                        media_type: row.media_type || mediaTypeMap[row.media_type_id] || 'movie'
                    });
                } else resolve(null);
            });
        });
    }

    static update(id, data) {
        return new Promise((resolve, reject) => {
            const fields = [];
            const values = [];

            const allowedFields = ['title', 'status', 'rating', 'reason', 'poster_url', 'media_type_id'];
            
            for (const field of allowedFields) {
                if (data[field] !== undefined) {
                    fields.push(`${field} = ?`);
                    values.push(data[field]);
                }
            }

            if (fields.length === 0) {
                return resolve(null);
            }

            values.push(id);

            const sql = `UPDATE media_items SET ${fields.join(', ')} WHERE id = ?`;
            
            db.run(sql, values, function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }

    static delete(id, userId) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM media_items WHERE id = ? AND user_id = ?';
            db.run(sql, [id, userId], function(err) {
                if (err) reject(err);
                else resolve(this.changes > 0);
            });
        });
    }
}

module.exports = MediaItem;
