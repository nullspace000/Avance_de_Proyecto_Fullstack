import React from 'react'


function moviesButton() {
}

function seriesButton() {
}

function gamesButton() {

}

function Menu() {
    return (
        <div>
            <ul>
                <li><button onClick={moviesButton}>Peliculas</button></li>
                <li><button onClick={seriesButton}>Series</button> </li>
                <li><button onClick={gamesButton}>Videojuegos</button></li>
            </ul>
        </div>
    )
}

export default Menu
