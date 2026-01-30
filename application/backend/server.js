/**
 * Media Tracker API Server
 * Main entry point for the backend application
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.resolve(__dirname, './media_tracker.db');

// Create database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');

        // Create tables
        db.serialize(() => {
            // Users table (optional)
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            // Media items table
            db.run(`CREATE TABLE IF NOT EXISTS media_items (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT NOT NULL,
                media_type TEXT NOT NULL CHECK(media_type IN ('movie', 'series', 'game')),
                note TEXT,
                reason TEXT,
                rating INTEGER CHECK(rating BETWEEN 0 AND 3),
                watched INTEGER DEFAULT 0 CHECK(watched IN (0, 1)),
                watch_date DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);

            console.log('Database schema initialized');
        });
    }
});

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // Allow all origins
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../frontend')));

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Media Tracker API is running',
        timestamp: new Date().toISOString()
    });
});

const DEMO_USER_ID = 'demo-user-001';

// GET all media
app.get('/api/media', (req, res) => {
    const { type } = req.query;

    let sql = 'SELECT * FROM media_items WHERE user_id = ?';
    const params = [DEMO_USER_ID];

    if (type) {
        sql += ' AND media_type = ?';
        params.push(type);
    }

    sql += ' ORDER BY created_at DESC';

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error('Error querying:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: rows, count: rows.length });
    });
});

// POST create media
app.post('/api/media', (req, res) => {
    const { title, media_type, note, reason, watched, rating } = req.body;

    console.log('Received data:', req.body);

    if (!title || !media_type) {
        return res.status(400).json({ success: false, error: 'Title and media_type are required' });
    }

    const validTypes = ['movie', 'series', 'game'];
    if (!validTypes.includes(media_type)) {
        return res.status(400).json({ success: false, error: `media_type must be one of: ${validTypes.join(', ')}` });
    }

    const { v4: uuidv4 } = require('uuid');
    const id = uuidv4();
    const watchValue = watched === true || watched === 1 ? 1 : 0;
    const ratingValue = rating !== undefined && rating !== null ? parseInt(rating) : null;

    db.run(`INSERT INTO media_items (id, user_id, title, media_type, note, reason, watched, rating)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, DEMO_USER_ID, title, media_type, note || '', reason || '', watchValue, ratingValue],
        function(err) {
            if (err) {
                console.error('Error inserting:', err.message);
                return res.status(500).json({ success: false, error: err.message });
            }

            db.get('SELECT * FROM media_items WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.status(201).json({ success: true, data: row });
            });
        }
    );
});

// PUT update media
app.put('/api/media/:id', (req, res) => {
    const { title, media_type, note, reason, rating, watched } = req.body;

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

    values.push(req.params.id, DEMO_USER_ID);

    db.run(`UPDATE media_items SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values, function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Media item not found' });
            }

            db.get('SELECT * FROM media_items WHERE id = ?', [req.params.id], (err, row) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true, data: row });
            });
        }
    );
});

// POST mark as watched
app.post('/api/media/:id/watch', (req, res) => {
    const { rating } = req.body;

    if (rating === undefined || rating === null) {
        return res.status(400).json({ success: false, error: 'Rating is required when marking as watched' });
    }

    const ratingValue = parseInt(rating);
    if (ratingValue < 0 || ratingValue > 3) {
        return res.status(400).json({ success: false, error: 'Rating must be between 0 and 3' });
    }

    db.run(`UPDATE media_items SET watched = 1, rating = ?, watch_date = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?`,
        [ratingValue, req.params.id, DEMO_USER_ID],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Media item not found' });
            }

            db.get('SELECT * FROM media_items WHERE id = ?', [req.params.id], (err, row) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                res.json({ success: true, data: row });
            });
        }
    );
});

// DELETE media
app.delete('/api/media/:id', (req, res) => {
    db.run('DELETE FROM media_items WHERE id = ? AND user_id = ?',
        [req.params.id, DEMO_USER_ID],
        function(err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Media item not found' });
            }

            res.json({ success: true, message: 'Media item deleted successfully' });
        }
    );
});

// Serve frontend for non-API routes
app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
});
