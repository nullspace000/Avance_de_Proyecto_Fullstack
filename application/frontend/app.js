// ========= CAMBIO DE VISTA ==========
const moviesBtn = document.getElementById('movies');
const seriesBtn = document.getElementById('series');
const gamesBtn = document.getElementById('games');

const viewMovies = document.getElementById('view-movies');
const viewSeries = document.getElementById('view-series');
const viewGames = document.getElementById('view-games');

function changeView(activeBtn, activeView) {
    [moviesBtn, seriesBtn, gamesBtn].forEach(btn => btn.classList.remove('active'));
    [viewMovies, viewSeries, viewGames].forEach(view => view.classList.remove('active'));

    activeBtn.classList.add('active');
    activeView.classList.add('active');
    
    loadMedia(); // Load data when switching tabs
}

moviesBtn.addEventListener('click', () => changeView(moviesBtn, viewMovies));
seriesBtn.addEventListener('click', () => changeView(seriesBtn, viewSeries));
gamesBtn.addEventListener('click', () => changeView(gamesBtn, viewGames));


// ========= API FUNCTIONS ==========
const API_URL = 'http://localhost:3000/api/media';

// Rating display mapping
const ratingLabels = {
    0: '',
    1: 'No me gustó',
    2: 'Me gustó',
    3: 'Me encantó'
};

async function loadMedia() {
    try {
        console.log('Fetching media...');
        const response = await fetch(API_URL);
        console.log('Response status:', response.status);
        const media = await response.json();
        console.log('Media loaded:', media);
        renderMedia(media);
    } catch (err) {
        console.error('Error loading media:', err);
    }
}

function renderMedia(media) {
    // Clear tables
    ['movies', 'series', 'games'].forEach(type => {
        document.getElementById(`${type}-watchlist`).innerHTML = '';
        document.getElementById(`${type}-loved`).innerHTML = '';
        document.getElementById(`${type}-liked`).innerHTML = '';
        document.getElementById(`${type}-disliked`).innerHTML = '';
    });
    
    media.forEach(item => {
        const type = item.media_type;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.title}</td>
            <td>${item.note || ''}</td>
            <td>${ratingLabels[item.rating] || ''}</td>
            <td>
                ${item.watched === 0 
                    ? `<button onclick="markAsWatched('${item.id}')">Marcar visto</button>`
                    : ''}
                <button onclick="deleteMedia('${item.id}')">Eliminar</button>
            </td>
        `;
        
        if (item.watched === 0) {
            document.getElementById(`${type}-watchlist`).appendChild(row);
        } else {
            const ratingTable = { 3: 'loved', 2: 'liked', 1: 'disliked' };
            const tableId = ratingTable[item.rating] || 'disliked';
            document.getElementById(`${type}-${tableId}`).appendChild(row);
        }
    });
}

async function addMediaToAPI(title, type, note) {
    try {
        console.log('Adding media:', { title, media_type: type, note });
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, media_type: type, note })
        });
        console.log('Add response status:', response.status);
        loadMedia();
    } catch (err) {
        console.error('Error:', err);
    }
}

async function markAsWatched(id, rating = 3) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rating })
        });
        loadMedia();
    } catch (err) {
        console.error('Error:', err);
    }
}

async function deleteMedia(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        loadMedia();
    } catch (err) {
        console.error('Error:', err);
    }
}

window.markAsWatched = markAsWatched;
window.deleteMedia = deleteMedia;


// ========= MODAL ==========
const modal = document.getElementById('add-movie-modal');
const addButtons = document.querySelectorAll('.add-btn');
const cancelBtn = document.getElementById('cancel');
const input = document.getElementById('item-input');

addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.style.display = 'flex';
        input.focus();
    });
});

function closeModal() {
    modal.style.display = 'none';
    input.value = '';
}

cancelBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});


// ========= AGREGAR A TABLA ==========
document.getElementById('add').addEventListener('click', () => {
    const title = input.value.trim();
    if (!title) return;

    let type;
    if (viewMovies.classList.contains('active')) type = 'movie';
    else if (viewSeries.classList.contains('active')) type = 'series';
    else type = 'game';

    addMediaToAPI(title, type, '');
    closeModal();
});


// Load media on start
loadMedia();
