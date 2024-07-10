import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { Howl } from "howler";

type SongState = {
  song: Howl | null;
}

const initialState: SongState = {
    song: null,
}

const songSlice = createSlice({
    name: "song",
    initialState,
    reducers: {
        setSong(state, action: PayloadAction<Howl>) {
            state.song = action.payload;
        },
    },
});

export const { setSong } = songSlice.actions;

export default songSlice.reducer;