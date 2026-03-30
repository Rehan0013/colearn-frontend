import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { fetchCurrentUserAction, logoutUserAction } from "@/actions/authActions";
import type { User } from "@/types";

interface UserState {
    data: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: UserState = {
    data: null,
    loading: true, // Initially true to avoid redirect race conditions on page load
    error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────

export const fetchCurrentUser = createAsyncThunk(
    "user/fetchCurrent",
    async (_, { rejectWithValue }) => {
        const res = await fetchCurrentUserAction();
        if (res.success) return res.user as User;
        return rejectWithValue(res.error);
    }
);

export const logoutUser = createAsyncThunk("user/logout", async (_, { rejectWithValue }) => {
    const res = await logoutUserAction();
    if (!res.success) return rejectWithValue(res.error);
    return true;
});

// ── Slice ─────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser(state, action: PayloadAction<User>) {
            state.data = action.payload;
        },
        clearUser(state) {
            state.data = null;
        },
        updateAvatar(state, action: PayloadAction<string>) {
            if (state.data) state.data.avatar = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCurrentUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.loading = false;
                state.data = action.payload;
            })
            .addCase(fetchCurrentUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
                state.data = null;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.data = null;
            });
    },
});

export const { setUser, clearUser, updateAvatar } = userSlice.actions;
export default userSlice.reducer;
