// =========  CAMBIO DE VISTA  ==========
const moviesBtn = document.getElementById( 'movies')
const seriesBtn = document.getElementById( 'series')
const gamesBtn = document.getElementById( 'games')
const viewMovies = document.getElementById('view-movies');
const viewSeries = document.getElementById('view-series');
const viewGames = document.getElementById('view-games');
const buttons = [moviesBtn, seriesBtn, gamesBtn];
const views = [viewMovies, viewSeries, viewGames];

function changeViwe(activeBtn, activeView) {
    buttons.forEach(btn => btn.classList.remove('active'));
    views.forEach(view => view.classList.remove('active'));

    activeBtn.classList.add('active');
    activeView.classList.add('active');
}

moviesBtn.addEventListener('click', () => changeViwe(moviesBtn, viewMovies));
seriesBtn.addEventListener('click', () => changeViwe(seriesBtn, viewSeries));
gamesBtn.addEventListener('click', () => changeViwe(gamesBtn, viewGames));

// =========  FUNCIONALIDAD BOTON ANIADIR  ==========

const addMovieBtn = document.getElementById('add-btn');
const addMovieModal = document.getElementById('add-movie-modal');
const addBtn = document.getElementById('add');
const cancelBtn = document.getElementById('cancel');

addMovieBtn.addEventListener('click', () => addMovieModal.classList.add('active'));
cancelBtn.addEventListener('click', () => addMovieModal.classList.remove('active'));
