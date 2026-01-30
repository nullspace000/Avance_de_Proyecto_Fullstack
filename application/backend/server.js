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

const express = require('express');
const app = express();
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

//#################
//#ENDPOINTS#######
//#################

//GET /api/media - Fetch existing media
app.get('/api/media', (req, res) => {
    db.all('SELECT * FROM media_items', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//POST /api/media - Insert new media
app.post('/api/media', (req, res) => {
    const { title, media_type, note } = req.body;
    const id = require('crypto').randomUUID(); // Generate UUID
    
    const sql = `INSERT INTO media_items (id, title, media_type, note, status) 
                 VALUES (?, ?, ?, ?, 'watchlist')`;
    
    db.run(sql, [id, title, media_type, note], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id, message: 'Media added' });
    });
});

//PUT /api/media/:id - Update media (mark as watched, add rating)
app.put('/api/media/:id', (req, res) => {
    const { status, rating, note } = req.body;
    const { id } = req.params;
    
    // Build dynamic update query
    let sql = 'UPDATE media_items SET status = ?';
    const params = [status];
    
    if (rating !== undefined) {
        sql += ', rating = ?';
        params.push(rating);
    }
    if (note !== undefined) {
        sql += ', note = ?';
        params.push(note);
    }
    if (status === 'watched') {
        sql += ", watched_at = datetime('now')";
    }
    
    sql += ' WHERE id = ?';
    params.push(id);
    
    db.run(sql, params, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Media updated' });
    });
});

//DELETE /api/media/:id - Delete media
app.delete('/api/media/:id', (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM media_items WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Media deleted' });
    });
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});