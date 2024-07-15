import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type SongArrayState = {
    songs: Array<string>;
    isOpen: boolean;
    openPlaylist: boolean;
    playlistID: number;
    index: number;
    signOut: boolean;
    playPlaylistID: number | null;
    isUniversallyPlaying: boolean;
    socket: WebSocket | null;
    sessionID: number;
    userID: string;
    isAdmin: boolean;
    duration: number;
    progress: number;
}

const initialState: SongArrayState = {
    songs: [],
    isOpen: true,
    openPlaylist: false,
    playlistID: -1,
    index: 0,
    signOut: false,
    playPlaylistID: null,
    isUniversallyPlaying: false,
    socket: null,
    sessionID: -1,
    userID: "",
    isAdmin: false,
    duration: 0,
    progress: 0,
}

const songArraySlice = createSlice({
    name: "songs",
    initialState,
    reducers: {
        setSongArray(state, action: PayloadAction<Array<string>>) {
            state.songs = action.payload;
        },
        setIsOpen(state, action: PayloadAction<boolean>) {
            state.isOpen = action.payload;
        },
        setOpenPlaylist(state, action: PayloadAction<boolean>) {
            state.openPlaylist = action.payload;
        },
        setPlaylistID(state, action: PayloadAction<number>) {
            state.playlistID = action.payload;
        },
        setIndex(state, action: PayloadAction<number>) {
            state.index = action.payload;
        },
        setSignOut(state, action: PayloadAction<boolean>) {
            state.signOut = action.payload;
        },
        setPlayPlaylistID(state, action: PayloadAction<number | null>) {
            state.playPlaylistID = action.payload;
        },
        setIsUniversallyPlaying(state, action: PayloadAction<boolean>) {
            state.isUniversallyPlaying = action.payload;
        },
        setSocket(state, action: PayloadAction<WebSocket | null>) {
            state.socket = action.payload;
        },
        setSessionID(state, action: PayloadAction<number>) {
            state.sessionID = action.payload;
        },
        setUserID(state, action: PayloadAction<string>) {
            state.userID = action.payload;
        },
        setIsAdmin(state, action: PayloadAction<boolean>) {
            state.isAdmin = action.payload;
        },
        setDuration(state, action: PayloadAction<number>) {
            state.duration = action.payload;
        },
        setProgress(state, action: PayloadAction<number>) {
            state.progress = action.payload;
        },
    },
});

export const { setSongArray, setIsOpen, setOpenPlaylist, setPlaylistID, setIndex, setSignOut, setPlayPlaylistID, setIsUniversallyPlaying, setSocket, setSessionID, setUserID, setIsAdmin, setDuration, setProgress } = songArraySlice.actions;

export default songArraySlice.reducer;