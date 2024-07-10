import { configureStore } from "@reduxjs/toolkit";
import songArrayReducer from "./songArraySlice";

export const store = configureStore({
    reducer: {
        songs: songArrayReducer,
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;