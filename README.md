# Media Tracker - Gestor de Películas, Series y Juegos

Una aplicación web para gestionar y rastrear el contenido multimedia que has visto, te gustó, o planeas ver.

## 📁 Estructura del Proyecto

```
Avance_de_Proyecto_Fullstack/
├── README.md
├── LICENSE
├── .gitignore
└── application/
    ├── backend/
    │   ├── server.js              # Punto de entrada del servidor
    │   ├── package.json           # Dependencias del backend
    │   └── src/
    │       ├── config/
    │       │   ├── constants.js   # Constantes de la aplicación
    │       │   ├── database.js    # Configuración de SQLite
    │       │   └── schema.js      # Esquema de la base de datos
    │       ├── controllers/
    │       │   ├── mediaController.js  # Lógica de medios
    │       │   └── userController.js   # Lógica de usuarios
    │       ├── middleware/
    │       │   └── auth.js        # Middleware de autenticación
    │       ├── models/
    │       │   ├── MediaItem.js   # Modelo de medios
    │       │   └── User.js        # Modelo de usuarios
    │       └── routes/
    │           ├── mediaRoutes.js # Rutas de medios
    │           └── userRoutes.js  # Rutas de usuarios
    │
    └── frontend/
        ├── index.html            # Estructura HTML
        ├── app.js                # Lógica JavaScript
        └── style.css             # Estilos CSS
```

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js (v14 o superior)
- npm

### Instalación

1. **Instalar dependencias del backend:**
   ```bash
   cd application/backend
   npm install
   ```

2. **Iniciar el servidor:**
   ```bash
   cd application/backend
   node server.js
   ```

3. **Abrir la aplicación:**
   Navega a `http://localhost:3000` en tu navegador.

## 🔧 API Endpoints

### Medios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/media` | Obtener todos los medios |
| GET | `/api/media/:id` | Obtener un medio por ID |
| POST | `/api/media` | Crear un nuevo medio |
| PUT | `/api/media/:id` | Actualizar un medio |
| DELETE | `/api/media/:id` | Eliminar un medio |

### Cuerpo de solicitud (POST/PUT):

```json
{
  "title": "Nombre del contenido",
  "media_type": "movies/series/games",
  "status": "watchlist/seen",
  "rating": "loved/liked/disliked",
  "reason": "Razón para ver (opcional)"
}
```

## 📱 Características

- **Gestión de Watchlist**: Agrega contenido que planeas ver
- **Calificaciones**: Clasifica contenido visto como:
  - ❤️ Me encantó
  - 👍 Me gustó
  - 👎 No me gustó
- **Marcador de visto**: Mueve contenido del watchlist a visto con calificación
- **Eliminación**: Elimina elementos que ya no quieras rastrear

## 🎨 Personalización

### Iconos de botones

En `application/frontend/app.js`, función `renderItem()` (líneas ~250-280):

```javascript
// Cambiar texto del botón "Marcar como visto"
seenBtn.textContent = '✅';  // o 'Visto', '👁️', etc.

// Cambiar texto del botón eliminar
deleteBtn.textContent = '🗑️';  // o 'Eliminar', '❌', etc.
```

### Estilos de botones

En `application/frontend/style.css`:

```css
.watch-btn {
    background-color: #5b7c8d;  /* Color de fondo */
    color: #ffffff;              /* Color de texto */
    border-radius: 10px;         /* Borde redondeado */
    padding: 5px 10px;           /* Espaciado interno */
}

.delete-btn {
    background-color: #e53935;   /* Color de fondo */
    color: #ffffff;              /* Color de texto */
    border-radius: 10px;
    padding: 5px 10px;
}
```

### Colores de secciones

En `application/frontend/style.css`:

```css
#seen-movies .media-container { border-left-color: #5b7c8d; }
#watchlist-movies .media-container { border-left-color: #7a8f7a; }

#seen-series .media-container { border-left-color: #6b7280; }
#watchlist-series .media-container { border-left-color: #8b9474; }

#seen-games .media-container { border-left-color: #7c6f91; }
#watchlist-games .media-container { border-left-color: #8a7f6d; }
```

## 🗄️ Base de Datos

La aplicación usa **SQLite** con las siguientes tablas:

- **users**: Usuarios registrados
- **media_items**: Películas, series y juegos
- **media_types**: Tipos de contenido (movie, series, game)

La base de datos se crea automáticamente al iniciar el servidor en:
`application/backend/media_tracker.db`

## 🔒 Autenticación

El sistema incluye autenticación JWT. Endpoints protegidos:
- `GET /api/users/profile`
- `PUT /api/users/profile`
- `DELETE /api/users/account`
- `POST /api/users/logout`
- `GET /api/users/me`

## 📝 Licencia

Este proyecto está bajo la licencia MIT.
