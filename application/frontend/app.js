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
}

moviesBtn.addEventListener('click', () => changeView(moviesBtn, viewMovies));
seriesBtn.addEventListener('click', () => changeView(seriesBtn, viewSeries));
gamesBtn.addEventListener('click', () => changeView(gamesBtn, viewGames));


// ========= MODAL ==========
const modal = document.getElementById('add-movie-modal');
const addButtons = document.querySelectorAll('.add-btn');
const cancelBtn = document.getElementById('cancel');
const addBtn = document.getElementById('add');
const input = document.getElementById('item-input');

// Abrir modal
addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modal.style.display = 'flex';
        input.focus();
    });
});

// Cerrar modal
function closeModal() {
    modal.style.display = 'none';
    input.value = '';
}

cancelBtn.addEventListener('click', closeModal);

window.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});


// ========= AGREGAR A TABLA ==========
addBtn.addEventListener('click', () => {
    const name = input.value.trim();
    if (!name) return;

    let table;

    if (viewMovies.classList.contains('active')) {
        table = document.getElementById('movies-watchlist');
    } else if (viewSeries.classList.contains('active')) {
        table = document.getElementById('series-watchlist');
    } else {
        table = document.getElementById('games-watchlist');
    }

    const row = document.createElement('tr');
    row.innerHTML = `<td>${name}</td>`;
    table.appendChild(row);

    closeModal();
});
