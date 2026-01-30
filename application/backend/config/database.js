/**
 * Database Configuration
 * Handles SQLite database connection and schema initialization
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = path.resolve(__dirname, '../../media_tracker.db');

// Database instance
let db = null;

/**
 * Initialize database connection and create tables
 * @returns {Promise<sqlite3.Database>}
 */
function initializeDatabase() {
    return new Promise((resolve, reject) => {
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');

            // Enable foreign keys
            db.run('PRAGMA foreign_keys = ON');

            // Create tables
            createTables()
                .then(() => resolve(db))
                .catch(reject);
        });
    });
}

/**
 * Create database schema with all required tables
 */
async function createTables() {
    const schema = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Media types enum table
        CREATE TABLE IF NOT EXISTS media_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL CHECK(name IN ('movie', 'series', 'game')),
            display_name TEXT NOT NULL
        );

        -- Rating scale table
        CREATE TABLE IF NOT EXISTS rating_scale (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            value INTEGER NOT NULL UNIQUE CHECK(value >= 0 AND value <= 3),
            label TEXT NOT NULL,
            description TEXT
        );

        -- Media items table
        CREATE TABLE IF NOT EXISTS media_items (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            media_type TEXT NOT NULL CHECK(media_type IN ('movie', 'series', 'game')),
            note TEXT,
            reason TEXT,
            rating INTEGER DEFAULT NULL CHECK(rating BETWEEN 0 AND 3),
            watched INTEGER DEFAULT 0 CHECK(watched IN (0, 1)),
            watch_date DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Genres table (for categorization)
        CREATE TABLE IF NOT EXISTS genres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL
        );

        -- Media genres junction table
        CREATE TABLE IF NOT EXISTS media_genres (
            media_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
            genre_id INTEGER NOT NULL REFERENCES genres(id) ON DELETE CASCADE,
            PRIMARY KEY (media_id, genre_id)
        );

        -- Indexes for better query performance
        CREATE INDEX IF NOT EXISTS idx_media_user_id ON media_items(user_id);
        CREATE INDEX IF NOT EXISTS idx_media_user_type ON media_items(user_id, media_type);
        CREATE INDEX IF NOT EXISTS idx_media_user_watched ON media_items(user_id, watched);
        CREATE INDEX IF NOT EXISTS idx_media_user_rating ON media_items(user_id, rating);
        CREATE INDEX IF NOT EXISTS idx_media_created_at ON media_items(created_at);
    `;

    return new Promise((resolve, reject) => {
        db.exec(schema, (err) => {
            if (err) {
                console.error('Error creating tables:', err.message);
                reject(err);
                return;
            }
            console.log('Database schema initialized');

            // Seed reference data
            seedReferenceData()
                .then(resolve)
                .catch(reject);
        });
    });
}

/**
 * Seed reference tables with initial data
 */
async function seedReferenceData() {
    const queries = [
        // Insert media types
        `INSERT OR IGNORE INTO media_types (name, display_name) VALUES 
            ('movie', 'Película'),
            ('series', 'Serie'),
            ('game', 'Juego')`,

        // Insert rating scale
        `INSERT OR IGNORE INTO rating_scale (value, label, description) VALUES 
            (0, 'Sin calificar', 'Aún no se ha asignado una calificación'),
            (1, 'No me gustó', 'No fue de mi agrado'),
            (2, 'Me gustó', 'Fue una experiencia positiva'),
            (3, 'Me encantó', 'Excelente, muy recomendado')`,

        // Insert common genres
        `INSERT OR IGNORE INTO genres (name) VALUES 
            ('Acción'), ('Aventura'), ('Comedia'), ('Drama'), ('Terror'),
            ('Ciencia Ficción'), ('Fantasia'), ('Romance'), ('Thriller'),
            ('Documental'), ('Animación'), ('Suspenso')`
    ];

    return new Promise((resolve, reject) => {
        db.exec(queries.join(';'), (err) => {
            if (err) {
                console.error('Error seeding reference data:', err.message);
                reject(err);
                return;
            }
            console.log('Reference data seeded');
            resolve();
        });
    });
}

/**
 * Get database instance
 * @returns {sqlite3.Database}
 */
function getDb() {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}

/**
 * Close database connection
 */
function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            } else {
                console.log('Database connection closed');
            }
        });
        db = null;
    }
}

module.exports = {
    initializeDatabase,
    getDb,
    closeDatabase
};
