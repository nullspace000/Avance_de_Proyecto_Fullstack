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

async function loadMedia() {
    try {
        const response = await fetch(API_URL);
        const media = await response.json();
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

    // Note: Your HTML uses lowercase ids like 'movies-watchlist'
    // but my code expects 'movies-watchlist' - need to check your HTML
    
    media.forEach(item => {
        // Your render logic here...
    });
}

async function addMediaToAPI(title, type, note) {
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, media_type: type, note })
        });
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
            body: JSON.stringify({ status: 'watched', rating })
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
