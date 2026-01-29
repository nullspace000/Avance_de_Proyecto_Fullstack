import { useEffect, useState } from "react";
import { MediaItem, Rating } from "./types";
import MoviesView from "./views/MoviesView";
import SeriesView from "./views/SeriesView";
import GamesView from "./views/GamesView";

const nav: React.CSSProperties = {
    display: "flex",
    gap: 10,
    marginBottom: 20
};


export default function App() {
    const [view, setView] = useState<"movies" | "series" | "games">("movies");
    const [media, setMedia] = useState<MediaItem[]>([]);

    // Cargar localStorage
    useEffect(() => {
        const saved = localStorage.getItem("media");
        if (saved) setMedia(JSON.parse(saved));
    }, []);

    // Guardar localStorage
    useEffect(() => {
        localStorage.setItem("media", JSON.stringify(media));
    }, [media]);

    const addMedia = (item: MediaItem) => {
        setMedia(prev => [...prev, item]);
    };

    const deleteMedia = (id: string) => {
        setMedia(prev => prev.filter(item => item.id !== id));
    };

    const moveToWatched = (id: string, rating: Rating) => {
        setMedia(prev =>
            prev.map(item =>
                item.id === id
                    ? { ...item, status: "watched", rating } as MediaItem
                    : item
            )
        );
    };

    const filtered = (type: "movie" | "series" | "game") =>
        media.filter(m => m.type === type);

    return (
        <div style={{ padding: 20 }}>
            <h1>Gestor de Medios</h1>

            <div style={nav}>
                <button onClick={() => setView("movies")}>🎬 Películas</button>
                <button onClick={() => setView("series")}>📺 Series</button>
                <button onClick={() => setView("games")}>🎮 Juegos</button>
            </div>


            {view === "movies" && (
                <MoviesView media={filtered("movie")} addMedia={addMedia} deleteMedia={deleteMedia} moveToWatched={moveToWatched} />
            )}
            {view === "series" && (
                <SeriesView media={filtered("series")} addMedia={addMedia} deleteMedia={deleteMedia} moveToWatched={moveToWatched} />
            )}
            {view === "games" && (
                <GamesView media={filtered("game")} addMedia={addMedia} deleteMedia={deleteMedia} moveToWatched={moveToWatched} />
            )}
        </div>
    );
}
