/**
 * Media Routes - Demo version without authentication required
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const DEMO_USER_ID = 'demo-user-001';

// Helper to get database
function getDb() {
    return require('../config/database').getDb();
}

// Get all media for demo user
router.get('/', async (req, res) => {
    try {
        const db = getDb();
        const { type } = req.query;

        let sql = 'SELECT * FROM media_items WHERE user_id = ?';
        const params = [DEMO_USER_ID];

        if (type) {
            sql += ' AND media_type = ?';
            params.push(type);
        }

        sql += ' ORDER BY created_at DESC';

        const media = await new Promise((resolve, reject) => {
            db.all(sql, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({ success: true, data: media, count: media.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get grouped media by type and status
router.get('/grouped', async (req, res) => {
    try {
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

        const stats = await new Promise((resolve, reject) => {
            db.all(sql, [DEMO_USER_ID], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Get individual items grouped
        const grouped = {
            movie: { loved: [], liked: [], disliked: [], watchlist: [] },
            series: { loved: [], liked: [], disliked: [], watchlist: [] },
            game: { loved: [], liked: [], disliked: [], watchlist: [] }
        };

        const types = ['movie', 'series', 'game'];
        const categories = [
            { type: 'loved', watched: 1, rating: 3 },
            { type: 'liked', watched: 1, rating: 2 },
            { type: 'disliked', watched: 1, rating: 1 },
            { type: 'watchlist', watched: 0, rating: null }
        ];

        for (const t of types) {
            for (const cat of categories) {
                let sql, params;
                if (cat.type === 'watchlist') {
                    sql = 'SELECT * FROM media_items WHERE user_id = ? AND media_type = ? AND watched = 0 ORDER BY created_at DESC';
                    params = [DEMO_USER_ID, t];
                } else {
                    sql = 'SELECT * FROM media_items WHERE user_id = ? AND media_type = ? AND watched = 1 AND rating = ? ORDER BY created_at DESC';
                    params = [DEMO_USER_ID, t, cat.rating];
                }

                const items = await new Promise((resolve, reject) => {
                    db.all(sql, params, (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows);
                    });
                });

                grouped[t][cat.type] = items;
            }
        }

        res.json({ success: true, data: { grouped, stats } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get user statistics
router.get('/stats', async (req, res) => {
    try {
        const db = getDb();

        const sql = `
            SELECT
                COUNT(*) as total_items,
                SUM(CASE WHEN watched = 1 THEN 1 ELSE 0 END) as watched_count,
                SUM(CASE WHEN watched = 0 THEN 1 ELSE 0 END) as watchlist_count,
                SUM(CASE WHEN watched = 1 AND rating = 3 THEN 1 ELSE 0 END) as loved_count,
                SUM(CASE WHEN watched = 1 AND rating = 2 THEN 1 ELSE 0 END) as liked_count,
                SUM(CASE WHEN watched = 1 AND rating = 1 THEN 1 ELSE 0 END) as disliked_count
            FROM media_items
            WHERE user_id = ?
        `;

        const stats = await new Promise((resolve, reject) => {
            db.get(sql, [DEMO_USER_ID], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.json({ success: true, data: stats });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Search media
router.get('/search', async (req, res) => {
    try {
        const db = getDb();
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ success: false, error: 'Search query is required' });
        }

        const searchTerm = `%${q}%`;
        const sql = `SELECT * FROM media_items WHERE user_id = ? AND (title LIKE ? OR note LIKE ? OR reason LIKE ?)
                     ORDER BY created_at DESC`;

        const results = await new Promise((resolve, reject) => {
            db.all(sql, [DEMO_USER_ID, searchTerm, searchTerm, searchTerm], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        res.json({ success: true, data: results, count: results.length });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get single media item
router.get('/:id', async (req, res) => {
    try {
        const db = getDb();
        const media = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM media_items WHERE id = ? AND user_id = ?',
                [req.params.id, DEMO_USER_ID], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
        });

        if (!media) {
            return res.status(404).json({ success: false, error: 'Media item not found' });
        }

        res.json({ success: true, data: media });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Create new media item
router.post('/', async (req, res) => {
    try {
        const db = getDb();
        const { title, media_type, note, reason, watched, rating } = req.body;

        if (!title || !media_type) {
            return res.status(400).json({ success: false, error: 'Title and media_type are required' });
        }

        const validTypes = ['movie', 'series', 'game'];
        if (!validTypes.includes(media_type)) {
            return res.status(400).json({ success: false, error: `media_type must be one of: ${validTypes.join(', ')}` });
        }

        const id = uuidv4();
        const watchValue = watched === true || watched === 1 ? 1 : 0;
        const ratingValue = rating !== undefined && rating !== null ? parseInt(rating) : null;

        await new Promise((resolve, reject) => {
            db.run(`INSERT INTO media_items (id, user_id, title, media_type, note, reason, watched, rating)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, DEMO_USER_ID, title, media_type, note || '', reason || '', watchValue, ratingValue],
                function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
        });

        const media = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM media_items WHERE id = ?', [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        res.status(201).json({ success: true, data: media });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update media item
router.put('/:id', async (req, res) => {
    try {
        const db = getDb();
        const { title, media_type, note, reason, rating, watched } = req.body;

        // Build dynamic update query
        const updates = [];
        const values = [];

        if (title !== undefined) { updates.push('title = ?'); values.push(title); }
        if (media_type !== undefined) { updates.push('media_type = ?'); values.push(media_type); }
        if (note !== undefined) { updates.push('note = ?'); values.push(note); }
        if (reason !== undefined) { updates.push('reason = ?'); values.push(reason); }
        if (rating !== undefined) { updates.push('rating = ?'); values.push(parseInt(rating)); }
        if (watched !== undefined) { updates.push('watched = ?'); values.push(watched === true || watched === 1 ? 1 : 0); }

        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        values.push(req.params.id, DEMO_USER_ID);

        await new Promise((resolve, reject) => {
            db.run(`UPDATE media_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
                values, function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
        });

        const media = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM media_items WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!media) {
            return res.status(404).json({ success: false, error: 'Media item not found' });
        }

        res.json({ success: true, data: media });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Mark media as watched
router.post('/:id/watch', async (req, res) => {
    try {
        const db = getDb();
        const { rating } = req.body;

        if (rating === undefined || rating === null) {
            return res.status(400).json({ success: false, error: 'Rating is required when marking as watched' });
        }

        const ratingValue = parseInt(rating);
        if (ratingValue < 0 || ratingValue > 3) {
            return res.status(400).json({ success: false, error: 'Rating must be between 0 and 3' });
        }

        await new Promise((resolve, reject) => {
            db.run(`UPDATE media_items SET watched = 1, rating = ?, watch_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND user_id = ?`,
                [ratingValue, req.params.id, DEMO_USER_ID],
                function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
        });

        const media = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM media_items WHERE id = ?', [req.params.id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });

        if (!media) {
            return res.status(404).json({ success: false, error: 'Media item not found' });
        }

        res.json({ success: true, data: media });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete media item
router.delete('/:id', async (req, res) => {
    try {
        const db = getDb();

        const result = await new Promise((resolve, reject) => {
            db.run('DELETE FROM media_items WHERE id = ? AND user_id = ?',
                [req.params.id, DEMO_USER_ID], function(err) {
                    if (err) reject(err);
                    else resolve(this);
                });
        });

        if (result.changes === 0) {
            return res.status(404).json({ success: false, error: 'Media item not found' });
        }

        res.json({ success: true, message: 'Media item deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
