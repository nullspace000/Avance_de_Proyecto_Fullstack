/**
 * MediaItem Model
 * Handles media item-related database operations
 */

const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../config/database');

class MediaItemModel {
    /**
     * Create a new media item
     * @param {string} userId - User ID
     * @param {Object} mediaData - Media item data
     * @returns {Promise<Object>} Created media item
     */
    static async create(userId, mediaData) {
        const db = getDb();
        const { title, media_type, note, reason, watched = 0, rating = null } = mediaData;
        const id = uuidv4();

        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO media_items (id, user_id, title, media_type, note, reason, watched, rating)
                         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

            db.run(sql, [id, userId, title, media_type, note, reason, watched, rating], function(err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve({
                    id,
                    user_id: userId,
                    title,
                    media_type,
                    note,
                    reason,
                    watched,
                    rating,
                    created_at: new Date().toISOString()
                });
            });
        });
    }

    /**
     * Find media item by ID
     * @param {string} id - Media item ID
     * @param {string} userId - User ID for authorization
     * @returns {Promise<Object|null>} Media item or null
     */
    static async findById(id, userId) {
        const db = getDb();

        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM media_items WHERE id = ? AND user_id = ?',
                [id, userId], (err, row) => {
                    if (err) reject(err);
                    resolve(row || null);
                });
        });
    }

    /**
     * Get all media items for a user
     * @param {string} userId - User ID
     * @param {Object} filters - Optional filters
     * @returns {Promise<Array>} Array of media items
     */
    static async findByUserId(userId, filters = {}) {
        const db = getDb();
        const { media_type, watched, rating, sortBy = 'created_at', sortOrder = 'DESC' } = filters;

        let sql = 'SELECT * FROM media_items WHERE user_id = ?';
        const params = [userId];

        if (media_type) {
            sql += ' AND media_type = ?';
            params.push(media_type);
        }

        if (watched !== undefined) {
            sql += ' AND watched = ?';
            params.push(watched);
        }

        if (rating !== undefined) {
            sql += ' AND rating = ?';
            params.push(rating);
        }

        // Validate sortBy to prevent SQL injection
        const allowedSortFields = ['title', 'created_at', 'updated_at', 'rating', 'watched'];
        const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

        sql += ` ORDER BY ${safeSortBy} ${safeSortOrder}`;

        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Get media items grouped by type and status
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Grouped media items
     */
    static async getGroupedByType(userId) {
        const db = getDb();

        const sql = `
            SELECT media_type,
                   SUM(CASE WHEN watched = 1 AND rating = 3 THEN 1 ELSE 0 END) as loved_count,
                   SUM(CASE WHEN watched = 1 AND rating = 2 THEN 1 ELSE 0 END) as liked_count,
                   SUM(CASE WHEN watched = 1 AND rating = 1 THEN 1 ELSE 0 END) as disliked_count,
                   SUM(CASE WHEN watched = 0 THEN 1 ELSE 0 END) as watchlist_count,
                   COUNT(*) as total
            FROM media_items
            WHERE user_id = ?
            GROUP BY media_type
        `;

        return new Promise((resolve, reject) => {
            db.all(sql, [userId], (err, rows) => {
                if (err) reject(err);

                const grouped = {
                    movie: { loved: [], liked: [], disliked: [], watchlist: [], stats: {} },
                    series: { loved: [], liked: [], disliked: [], watchlist: [], stats: {} },
                    game: { loved: [], liked: [], disliked: [], watchlist: [], stats: {} }
                };

                // Get individual items
                Promise.all([
                    this.getItemsByCategory(userId, 'movie', 3),
                    this.getItemsByCategory(userId, 'movie', 2),
                    this.getItemsByCategory(userId, 'movie', 1),
                    this.getItemsByCategory(userId, 'movie', 0),
                    this.getItemsByCategory(userId, 'series', 3),
                    this.getItemsByCategory(userId, 'series', 2),
                    this.getItemsByCategory(userId, 'series', 1),
                    this.getItemsByCategory(userId, 'series', 0),
                    this.getItemsByCategory(userId, 'game', 3),
                    this.getItemsByCategory(userId, 'game', 2),
                    this.getItemsByCategory(userId, 'game', 1),
                    this.getItemsByCategory(userId, 'game', 0)
                ]).then(results => {
                    grouped.movie.loved = results[0];
                    grouped.movie.liked = results[1];
                    grouped.movie.disliked = results[2];
                    grouped.movie.watchlist = results[3];
                    grouped.series.loved = results[4];
                    grouped.series.liked = results[5];
                    grouped.series.disliked = results[6];
                    grouped.series.watchlist = results[7];
                    grouped.game.loved = results[8];
                    grouped.game.liked = results[9];
                    grouped.game.disliked = results[10];
                    grouped.game.watchlist = results[11];

                    resolve(grouped);
                }).catch(reject);
            });
        });
    }

    /**
     * Get items by category (type and rating/watched status)
     */
    static async getItemsByCategory(userId, mediaType, ratingOrWatched) {
        const db = getDb();

        let sql, params;
        if (ratingOrWatched === 0) {
            sql = 'SELECT * FROM media_items WHERE user_id = ? AND media_type = ? AND watched = 0 ORDER BY created_at DESC';
            params = [userId, mediaType];
        } else {
            sql = 'SELECT * FROM media_items WHERE user_id = ? AND media_type = ? AND watched = 1 AND rating = ? ORDER BY created_at DESC';
            params = [userId, mediaType, ratingOrWatched];
        }

        return new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                resolve(rows);
            });
        });
    }

    /**
     * Update media item
     * @param {string} id - Media item ID
     * @param {string} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<Object>} Updated media item
     */
    static async update(id, userId, updates) {
        const db = getDb();
        const allowedFields = ['title', 'media_type', 'note', 'reason', 'rating', 'watched'];
        const setClauses = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
            if (allowedFields.includes(key)) {
                setClauses.push(`${key} = ?`);
                values.push(value);
            }
        }

        if (setClauses.length === 0) {
            return this.findById(id, userId);
        }

        // If marking as watched, set watch_date
        if (updates.watched === 1 && !updates.watch_date) {
            setClauses.push('watch_date = CURRENT_TIMESTAMP');
        }

        setClauses.push('updated_at = CURRENT_TIMESTAMP');
        values.push(id, userId);

        return new Promise((resolve, reject) => {
            const sql = `UPDATE media_items SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`;

            db.run(sql, values, function(err) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this.changes > 0 ? this.findById(id, userId) : null);
            });
        });
    }

    /**
     * Mark media as watched with rating
     * @param {string} id - Media item ID
     * @param {string} userId - User ID
     * @param {number} rating - Rating (1-3)
     * @returns {Promise<Object>} Updated media item
     */
    static async markAsWatched(id, userId, rating) {
        return this.update(id, userId, { watched: 1, rating });
    }

    /**
     * Delete media item
     * @param {string} id - Media item ID
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Success status
     */
    static async delete(id, userId) {
        const db = getDb();

        return new Promise((resolve, reject) => {
            db.run('DELETE FROM media_items WHERE id = ? AND user_id = ?', [id, userId], function(err) {
                if (err) reject(err);
                resolve(this.changes > 0);
            });
        });
    }

    /**
     * Get user statistics
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Statistics object
     */
    static async getStats(userId) {
        const db = getDb();

        const sql = `
            SELECT
                COUNT(*) as total_items,
                SUM(CASE WHEN watched = 1 THEN 1 ELSE 0 END) as watched_count,
                SUM(CASE WHEN watched = 0 THEN 1 ELSE 0 END) as watchlist_count,
                SUM(CASE WHEN watched = 1 AND rating = 3 THEN 1 ELSE 0 END) as loved_count,
                SUM(CASE WHEN watched = 1 AND rating = 2 THEN 1 ELSE 0 END) as liked_count,
                SUM(CASE WHEN watched = 1 AND rating = 1 THEN 1 ELSE 0 END) as disliked_count,
                SUM(CASE WHEN watched = 1 AND rating IS NULL THEN 1 ELSE 0 END) as unrated_count
            FROM media_items
            WHERE user_id = ?
        `;

        return new Promise((resolve, reject) => {
            db.get(sql, [userId], (err, row) => {
                if (err) reject(err);
                resolve(row);
            });
        });
    }

    /**
     * Search media items
     * @param {string} userId - User ID
     * @param {string} query - Search query
     * @returns {Promise<Array>} Matching items
     */
    static async search(userId, query) {
        const db = getDb();
        const searchTerm = `%${query}%`;

        return new Promise((resolve, reject) => {
            db.all(`SELECT * FROM media_items WHERE user_id = ? AND (title LIKE ? OR note LIKE ? OR reason LIKE ?)
                    ORDER BY created_at DESC`,
                [userId, searchTerm, searchTerm, searchTerm], (err, rows) => {
                    if (err) reject(err);
                    resolve(rows);
                });
        });
    }
}

module.exports = MediaItemModel;
