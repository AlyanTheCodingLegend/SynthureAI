export type Song = {
    id: number;
    song_name: string;
    song_path: string;
    artist_name: string;
    image_path: string;
}

export type Playlist = {
    playlist_id: number;
    playlist_name: string;
    cover_url: string;
}

export type Model = {
    name: string;
    display_name: string;
    description: string;
}