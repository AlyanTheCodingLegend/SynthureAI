import { configureStore } from "@reduxjs/toolkit";
import songArrayReducer from "./songArraySlice";

export const store = configureStore({
    reducer: {
        songs: songArrayReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware({
            serializableCheck: false,
        });
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;