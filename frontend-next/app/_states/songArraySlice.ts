import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type SongArrayState = {
  songs: Array<string>;
}

const initialState: SongArrayState = {
    songs: [],
}

const songArraySlice = createSlice({
    name: "songs",
    initialState,
    reducers: {
        setSongArray(state, action: PayloadAction<Array<string>>) {
            state.songs = action.payload;
        },
    },
});

export const { setSongArray } = songArraySlice.actions;

export default songArraySlice.reducer;