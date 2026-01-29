import { MediaItem, Rating } from "../../types";

interface Props {
    title: string;
    items: MediaItem[];
    deleteMedia: (id: string) => void;
    moveToWatched?: (id: string, rating: Rating) => void;
}

export default function MediaList({ title, items, deleteMedia, moveToWatched }: Props) {
    return (
        <div style={grid}>
            {items.map(item => (
                <div key={item.id} style={card}>
                    <h4>{item.title}</h4>

                    {item.status === "watchlist" && moveToWatched && (
                        <button style={primaryBtn} onClick={() => moveToWatched(item.id, "liked")}>
                            Marcar como vista
                        </button>
                    )}

                    <button style={dangerBtn} onClick={() => deleteMedia(item.id)}>
                        Eliminar
                    </button>
                </div>
            ))}
        </div>

    );
}
