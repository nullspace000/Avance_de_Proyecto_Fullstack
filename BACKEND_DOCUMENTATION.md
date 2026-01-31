# Backend Architecture & Database Structure

## 📁 Backend Directory Structure

```
application/backend/
├── data/                    # Database storage
│   └── media_tracker.db    # SQLite database file
├── src/
│   ├── config/
│   │   ├── database.js     # Database connection
│   │   ├── schema.js       # SQL schema definitions
│   │   └── constants.js    # App constants
│   ├── controllers/
│   │   ├── mediaController.js
│   │   └── userController.js
│   ├── middleware/
│   │   └── auth.js         # JWT authentication
│   ├── models/
│   │   ├── MediaItem.js
│   │   └── User.js
│   └── routes/
│       ├── mediaRoutes.js
│       └── userRoutes.js
├── .env                    # Environment variables
├── package.json
└── server.js               # Express app entry point
```

---

## 🗄️ Database Schema (SQLite)

### **1. Users Table**
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **2. Media Types Reference Table**
```sql
CREATE TABLE media_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Default values:
-- (1, 'movie', '🎬')
-- (2, 'series', '📺')
-- (3, 'game', '🎮')
```

### **3. Media Items Table**
```sql
CREATE TABLE media_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_type_id INTEGER NOT NULL REFERENCES media_types(id),
    title TEXT NOT NULL,
    original_title TEXT,
    description TEXT,
    note TEXT,
    reason TEXT,
    rating INTEGER CHECK(rating BETWEEN 0 AND 5),
    watched INTEGER DEFAULT 0 CHECK(watched IN (0, 1)),
    watch_date DATE,
    poster_url TEXT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### **4. Watchlist Table**
```sql
CREATE TABLE watchlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    media_item_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    priority INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, media_item_id)
);
```

### **5. Custom Lists Table**
```sql
CREATE TABLE custom_lists (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE custom_list_items (
    id TEXT PRIMARY KEY,
    list_id TEXT NOT NULL REFERENCES custom_lists(id) ON DELETE CASCADE,
    media_item_id TEXT NOT NULL REFERENCES media_items(id) ON DELETE CASCADE,
    sort_order INTEGER DEFAULT 0,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(list_id, media_item_id)
);
```

### **6. Indexes (Performance)**
```sql
CREATE INDEX idx_media_user ON media_items(user_id);
CREATE INDEX idx_media_type ON media_items(media_type_id);
CREATE INDEX idx_media_watched ON media_items(user_id, watched);
CREATE INDEX idx_media_rating ON media_items(user_id, rating);
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_custom_list_user ON custom_lists(user_id);
```

---

## 🔌 API Endpoints

### **Authentication Routes** (`/api/auth`)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get JWT token |
| GET | `/me` | Get current user info |
| PUT | `/me` | Update current user |

### **Media Routes** (`/api/media`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all media items | ✅ |
| GET | `/:id` | Get single media item | ✅ |
| GET | `/type/:type` | Get by media type | ✅ |
| GET | `/watchlist` | Get watchlist | ✅ |
| POST | `/` | Create media item | ✅ |
| PUT | `/:id` | Update media item | ✅ |
| DELETE | `/:id` | Delete media item | ✅ |

### **List Routes** (`/api/lists`)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all user lists | ✅ |
| GET | `/:id` | Get list details | ✅ |
| POST | `/` | Create custom list | ✅ |
| PUT | `/:id` | Update list | ✅ |
| DELETE | `/:id` | Delete list | ✅ |
| POST | `/:id/items` | Add item to list | ✅ |
| DELETE | `/:id/items/:itemId` | Remove item from list | ✅ |

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "bcryptjs": "^2.4.3",        # Password hashing
    "cors": "^2.8.5",            # CORS support
    "dotenv": "^16.3.1",         # Environment variables
    "express": "^4.18.2",        # Web framework
    "jsonwebtoken": "^9.0.2",    # JWT authentication
    "sqlite3": "^5.1.6",         # SQLite database
    "uuid": "^9.0.0"             # Unique IDs
  }
}
```

---

## 🔐 Environment Variables (`.env`)

```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
DB_PATH=./data/media_tracker.db
```

---

## 🏗️ Backend Flow

```
Request → Routes → Middleware (Auth) → Controller → Model → Database
                                      ↓
                               Response (JSON)
```

---

## 🚀 Running the Backend

```bash
cd application/backend
npm install
node server.js
# Server runs on http://localhost:3000
```

---

## 📝 Key Features

1. **JWT Authentication** - Secure stateless authentication
2. **SQLite with WAL Mode** - Better concurrent performance
3. **Foreign Keys** - Data integrity with CASCADE delete
4. **Soft Deletes Possible** - Add `deleted_at` column if needed
5. **JSON Metadata** - Flexible data storage for extra info
6. **Indexes** - Optimized queries for user-specific data
