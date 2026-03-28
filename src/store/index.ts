import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import roomReducer from "./slices/roomSlice";
import chatReducer from "./slices/chatSlice";
import notesReducer from "./slices/notesSlice";
import pomodoroReducer from "./slices/pomodoroSlice";
import sessionReducer from "./slices/sessionSlice";
import notificationReducer from "./slices/notificationSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        room: roomReducer,
        chat: chatReducer,
        notes: notesReducer,
        pomodoro: pomodoroReducer,
        session: sessionReducer,
        notification: notificationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
