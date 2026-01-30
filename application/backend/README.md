# Media Tracker - Backend Structure

## Project Overview

A full-stack media tracking application for managing movies, series, and games with watchlists and ratings.

## Backend Architecture

```
backend/
├── config/
│   └── database.js          # Database configuration and schema
├── controllers/
│   ├── authController.js    # Authentication operations
│   └── mediaController.js   # Media CRUD operations
├── middlewares/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js      # Error handling middleware
├── models/
│   ├── User.js              # User model
│   ├── MediaItem.js         # Media item model
│   └── index.js             # Models index
├── routes/
│   ├── auth.js              # Authentication routes
│   └── media.js             # Media routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies and scripts
└── server.js                # Main server entry point
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Media Items Table
```sql
CREATE TABLE media_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    media_type TEXT NOT NULL CHECK(media_type IN ('movie', 'series', 'game')),
    note TEXT,
    reason TEXT,
    rating INTEGER CHECK(rating BETWEEN 0 AND 3),
    watched INTEGER DEFAULT 0 CHECK(watched IN (0, 1)),
    watch_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Supporting Tables
- `media_types` - Reference table for media types
- `rating_scale` - Reference table for rating labels
- `genres` - Genre categorization
- `media_genres` - Junction table for media-genre relationships

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user profile |
| PUT | `/api/auth/me` | Update user profile |
| POST | `/api/auth/logout` | Logout |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | Get all media items |
| GET | `/api/media/grouped` | Get grouped media by type/status |
| GET | `/api/media/stats` | Get user statistics |
| GET | `/api/media/search?q=query` | Search media |
| GET | `/api/media/:id` | Get single media item |
| POST | `/api/media` | Create new media item |
| PUT | `/api/media/:id` | Update media item |
| POST | `/api/media/:id/watch` | Mark as watched |
| DELETE | `/api/media/:id` | Delete media item |

## Setup Instructions

1. Install dependencies:
```bash
cd application/backend
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your settings
```

3. Start the server:
```bash
npm start
```

## Dependencies

- **express** - Web framework
- **sqlite3** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - CORS middleware
- **dotenv** - Environment variables
- **uuid** - Unique ID generation

## Rating System

| Value | Label | Description |
|-------|-------|-------------|
| 0 | Sin calificar | No rating assigned |
| 1 | No me gustó | Did not enjoy |
| 2 | Me gustó | Liked |
| 3 | Me encantó | Loved |

## Media Types

- `movie` - Películas
- `series` - Series
- `game` - Juegos
