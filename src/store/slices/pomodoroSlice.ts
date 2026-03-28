import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { PomodoroState, PomodoroMode } from "@/types";

const initialState: PomodoroState = {
    roomId: "",
    mode: "focus",
    duration: 25 * 60,
    remaining: 25 * 60,
    isRunning: false,
    startedBy: null,
};

const pomodoroSlice = createSlice({
    name: "pomodoro",
    initialState,
    reducers: {
        setPomodoroState(state, action: PayloadAction<PomodoroState>) {
            return action.payload;
        },
        tick(state, action: PayloadAction<number>) {
            state.remaining = action.payload;
        },
        setMode(state, action: PayloadAction<PomodoroMode>) {
            state.mode = action.payload;
        },
        resetPomodoro(state) {
            state.remaining = state.duration;
            state.isRunning = false;
        },
        clearPomodoro() {
            return initialState;
        },
    },
});

export const { setPomodoroState, tick, setMode, resetPomodoro, clearPomodoro } = pomodoroSlice.actions;
export default pomodoroSlice.reducer;
