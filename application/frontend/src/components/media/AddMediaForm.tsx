import { useState } from "react";
import { MediaItem, MediaType, Rating } from "../../types";

interface Props {
    type: MediaType;
    addMedia: (item: MediaItem) => void;
    closeModal: () => void;
}

export default function AddMediaForm({ type, addMedia, closeModal }: Props) {
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState<"watched" | "watchlist">("watched");
    const [rating, setRating] = useState<Rating>("loved");
    const [reason, setReason] = useState("");

    const handleSubmit = () => {
        if (!title) return;

        const base = { id: Date.now().toString(), title, type };

        if (status === "watched") {
            addMedia({ ...base, status, rating });
        } else {
            addMedia({ ...base, status, reasonToWatch: reason });
        }

        closeModal();
    };

    return (
        <div>
            <input placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />

            <select value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="watched">Vista</option>
                <option value="watchlist">Por ver</option>
            </select>

            {status === "watched" && (
                <select value={rating} onChange={e => setRating(e.target.value as Rating)}>
                    <option value="loved">Me encantó</option>
                    <option value="liked">Me gustó</option>
                    <option value="disliked">No me gustó</option>
                </select>
            )}

            {status === "watchlist" && (
                <input placeholder="Razón para ver" value={reason} onChange={e => setReason(e.target.value)} />
            )}

            <button onClick={handleSubmit}>Guardar</button>
        </div>
    );
}
