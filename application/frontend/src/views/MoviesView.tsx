import { useState } from "react";
import { MediaItem, Rating } from "../types";
import AddMediaForm from "../components/media/AddMediaForm";
import MediaList from "../components/media/MediaList";
import Modal from "../components/UI/Modal";

interface Props {
    media: MediaItem[];
    addMedia: (item: MediaItem) => void;
    deleteMedia: (id: string) => void;
    moveToWatched: (id: string, rating: Rating) => void;
}

export default function MoviesView({ media, addMedia, deleteMedia, moveToWatched }: Props) {
    const [open, setOpen] = useState(false);

    const watched = media.filter(m => m.status === "watched");
    const watchlist = media.filter(m => m.status === "watchlist");

    return (
        <div>
            <button onClick={() => setOpen(true)}>Agregar película</button>

            <Modal isOpen={open} onClose={() => setOpen(false)}>
                <AddMediaForm type="movie" addMedia={addMedia} closeModal={() => setOpen(false)} />
            </Modal>

            <MediaList title="Me encantó" items={watched.filter(m => m.rating === "loved")} deleteMedia={deleteMedia} />
            <MediaList title="Me gustó" items={watched.filter(m => m.rating === "liked")} deleteMedia={deleteMedia} />
            <MediaList title="No me gustó" items={watched.filter(m => m.rating === "disliked")} deleteMedia={deleteMedia} />

            <MediaList title="Por ver" items={watchlist} deleteMedia={deleteMedia} moveToWatched={moveToWatched} />
        </div>
    );
}
