const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', '..', 'media_tracker.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database:', dbPath);
    }
});

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Media types reference
CREATE TABLE IF NOT EXISTS media_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Media items table
CREATE TABLE IF NOT EXISTS media_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_type_id INTEGER NOT NULL REFERENCES media_types(id),
    title TEXT NOT NULL,
    original_title TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'watchlist' CHECK(status IN ('watchlist', 'seen')),
    rating TEXT CHECK(rating IN ('loved', 'liked', 'disliked')),
    reason TEXT,
    poster_url TEXT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Watchlist entries
CREATE TABLE IF NOT EXISTS watchlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_item_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, media_item_id)
);

-- Custom lists
CREATE TABLE IF NOT EXISTS custom_lists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custom_list_items (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
    media_item_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(list_id, media_item_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_user ON media_items(user_id);
CREATE INDEX IF NOT EXISTS idx_media_type ON media_items(media_type_id);
CREATE INDEX IF NOT EXISTS idx_media_status ON media_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_media_rating ON media_items(user_id, rating);
CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_list_user ON custom_lists(user_id);
`;

// Initialize database
db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');
    db.run('PRAGMA journal_mode = WAL');
    
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error creating tables:', err.message);
        } else {
            console.log('Database schema initialized');
        }
    });

    // Insert default media types if not exists
    const insertMediaTypes = `
        INSERT OR IGNORE INTO media_types (id, name, icon) VALUES
        (1, 'movie', '🎬'),
        (2, 'series', '📺'),
        (3, 'game', '🎮')
    `;
    db.run(insertMediaTypes);

    // Insert default user if not exists
    const insertDefaultUser = `
        INSERT OR IGNORE INTO users (id, username, email, password_hash) VALUES
        ('default-user', 'default', 'default@example.com', 'placeholder')
    `;
    db.run(insertDefaultUser);
});

module.exports = db;
