export type Rating = 'loved' | 'liker' | 'disliked';
export type MediaStatus = 'watched' | 'watchlist';

export interface MediaItem {
    id: String;
    title: String;
    status: MediaStatus;
    rating: Rating;
    reasonToWatch: String;
}