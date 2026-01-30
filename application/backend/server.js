const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'media_tracker.db');

const schema = `
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    media_type TEXT CHECK(media_type IN ('movie', 'series', 'game')) NOT NULL,
    status TEXT CHECK(status IN ('watchlist', 'watched')) NOT NULL DEFAULT 'watchlist',
    note TEXT,
    rating INTEGER CHECK(rating BETWEEN 0 AND 3),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    watched_at DATETIME,
    
    CONSTRAINT rating_required_for_watched 
        CHECK (status = 'watchlist' OR rating IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_media_user_type_status ON media_items(user_id, media_type, status);
CREATE INDEX IF NOT EXISTS idx_media_user_rating ON media_items(user_id, media_type, rating);
`;

// Initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error creating tables:', err.message);
            } else {
                console.log('Database schema initialized');
            }
        });
    }
});

module.exports = db;

// Add Express server code below...
// 1. Imports at top
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const path = require('path');

// 2. Database setup
const dbPath = path.join(__dirname, 'media_tracker.db');
const db = new sqlite3.Database(dbPath, (err) => { ... });

const schema = `...`; // your CREATE TABLE statements
db.exec(schema, ...);

// 3. Express app setup
const app = express();
app.use(express.json());

// 4. API endpoints (routes)
app.get('/api/media', (req, res) => { ... });
app.post('/api/media', (req, res) => { ... });
app.put('/api/media/:id', (req, res) => { ... });
app.delete('/api/media/:id', (req, res) => { ... });

// 5. Start server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});