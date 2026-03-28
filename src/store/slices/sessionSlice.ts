import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { sessionApi } from "@/lib/api";
import type { UserStats, ChartDataPoint, Session } from "@/types";

interface SessionState {
    stats: UserStats | null;
    chartData: ChartDataPoint[];
    history: Session[];
    loading: boolean;
    error: string | null;
}

const initialState: SessionState = {
    stats: null,
    chartData: [],
    history: [],
    loading: false,
    error: null,
};

export const fetchStats = createAsyncThunk(
    "session/fetchStats",
    async (_, { rejectWithValue }) => {
        try {
            const res = await sessionApi.get("/api/sessions/stats");
            return res.data.stats as UserStats;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch stats");
        }
    }
);

export const fetchChartData = createAsyncThunk(
    "session/fetchChartData",
    async (range: "week" | "month", { rejectWithValue }) => {
        try {
            const res = await sessionApi.get(`/api/sessions/charts?range=${range}`);
            return res.data.data as ChartDataPoint[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch chart data");
        }
    }
);

export const fetchHistory = createAsyncThunk(
    "session/fetchHistory",
    async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        try {
            const res = await sessionApi.get(`/api/sessions/history?page=${page}&limit=${limit}`);
            return res.data; // Includes sessions and pagination
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch history");
        }
    }
);

const sessionSlice = createSlice({
    name: "session",
    initialState,
    reducers: {
        clearSessionState: (state) => {
            state.stats = null;
            state.chartData = [];
            state.history = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchStats.fulfilled, (state, action) => {
                state.stats = action.payload;
                state.loading = false;
            })
            .addCase(fetchStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchChartData.fulfilled, (state, action) => {
                state.chartData = action.payload;
            })
            .addCase(fetchHistory.fulfilled, (state, action) => {
                state.history = action.payload.sessions;
            });
    },
});

export const { clearSessionState } = sessionSlice.actions;
export default sessionSlice.reducer;
