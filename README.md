# Gestor de Medios – Proyecto Fullstack

Gestor de Medios es una aplicación web Fullstack que permite a los usuarios organizar y gestionar contenido multimedia como películas, series y videojuegos, clasificándolos según su estado (por ver / visto) y su calificación personal.

El sistema cuenta con un backend RESTful desarrollado en Node.js y Express, una base de datos SQLite, y un frontend en HTML, CSS y JavaScript puro, con una interfaz visual clara y organizada.

---

## Funcionalidades principales

### Frontend
- Navegación por pestañas: Películas, Series y Juegos
- Separación por estado:
  - Por ver
  - Vistos / Jugados
- Clasificación de contenido visto por calificación:
  - Me encantó
  - Me gustó
  - No me gustó
- Modal dinámico para agregar nuevos elementos
- Interfaz limpia basada en principios básicos de UI/UX

### Backend
- API RESTful con Express.js
- CRUD completo de contenido multimedia
- Base de datos SQLite
- Autenticación con JWT 
- Middleware personalizado de manejo de errores
- Uso de variables de entorno con dotenv

---

## Tecnologías utilizadas

### Backend
- Node.js
- Express.js
- SQLite3
- jsonwebtoken
- bcryptjs
- cors
- dotenv
- uuid
- express-validator

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JS)

---

## Diseño del Frontend (UI/UX)

- Barra de navegación superior con acceso a:
  - Películas
  - Series
  - Juegos

- Distribución clara en columnas:
  - Contenido visto
  - Contenido por ver

- Uso de colores suaves y contrastes sutiles

- Botones visibles y accesibles

- Modal centrado para agregar elementos

- Calificación visual mediante opciones seleccionables


