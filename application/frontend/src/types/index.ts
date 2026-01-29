export type Rating = "loved" | "liked" | "disliked";
export type MediaStatus = "watched" | "watchlist";
export type MediaType = "movie" | "series" | "game";

interface BaseMedia {
    id: string;
    title: string;
    type: MediaType;
}

export interface WatchedMedia extends BaseMedia {
    status: "watched";
    rating: Rating;
}

export interface WatchlistMedia extends BaseMedia {
    status: "watchlist";
    reasonToWatch: string;
}

export type MediaItem = WatchedMedia | WatchlistMedia;

