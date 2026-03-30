import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { 
    fetchStatsAction, 
    fetchChartDataAction, 
    fetchHistoryAction 
} from "@/actions/sessionActions";
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
        const res = await fetchStatsAction();
        if (res.success) return res.stats as UserStats;
        return rejectWithValue(res.error);
    }
);

export const fetchChartData = createAsyncThunk(
    "session/fetchChartData",
    async (range: "week" | "month", { rejectWithValue }) => {
        const res = await fetchChartDataAction(range);
        if (res.success) return res.data as ChartDataPoint[];
        return rejectWithValue(res.error);
    }
);

export const fetchHistory = createAsyncThunk(
    "session/fetchHistory",
    async ({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
        const res = await fetchHistoryAction({ page, limit });
        if (res.success) return res.data; // Includes sessions and pagination
        return rejectWithValue(res.error);
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
