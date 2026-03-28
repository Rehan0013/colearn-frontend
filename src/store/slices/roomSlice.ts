import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { roomApi } from "@/lib/api";
import type { Room, PresenceUser } from "@/types";

interface RoomState {
    list: Room[];
    current: Room | null;
    presenceUsers: PresenceUser[];
    loading: boolean;
    error: string | null;
}

const initialState: RoomState = {
    list: [],
    current: null,
    presenceUsers: [],
    loading: false,
    error: null,
};

export const fetchPublicRooms = createAsyncThunk(
    "room/fetchPublic",
    async (params: { subject?: string; page?: number } = {}, { rejectWithValue }) => {
        try {
            const res = await roomApi.get("/api/rooms", { params });
            return res.data.rooms as Room[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to fetch rooms");
        }
    }
);

export const fetchMyRooms = createAsyncThunk(
    "room/fetchMine",
    async (_, { rejectWithValue }) => {
        try {
            const res = await roomApi.get("/api/rooms/my-rooms");
            return res.data.rooms as Room[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

export const fetchRoomById = createAsyncThunk(
    "room/fetchById",
    async (roomId: string, { rejectWithValue }) => {
        try {
            const res = await roomApi.get(`/api/rooms/${roomId}`);
            return res.data.room as Room;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message);
        }
    }
);

const roomSlice = createSlice({
    name: "room",
    initialState,
    reducers: {
        setCurrentRoom(state, action: PayloadAction<Room>) {
            state.current = action.payload;
        },
        clearCurrentRoom(state) {
            state.current = null;
            state.presenceUsers = [];
        },
        setPresenceUsers(state, action: PayloadAction<PresenceUser[]>) {
            state.presenceUsers = action.payload;
        },
        addPresenceUser(state, action: PayloadAction<PresenceUser>) {
            const exists = state.presenceUsers.find(u => u.userId === action.payload.userId);
            if (!exists) state.presenceUsers.push(action.payload);
        },
        removePresenceUser(state, action: PayloadAction<string>) {
            state.presenceUsers = state.presenceUsers.filter(u => u.userId !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchPublicRooms.pending, (state) => { state.loading = true; })
            .addCase(fetchPublicRooms.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchPublicRooms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchMyRooms.fulfilled, (state, action) => {
                state.list = action.payload;
            })
            .addCase(fetchRoomById.fulfilled, (state, action) => {
                state.current = action.payload;
                state.loading = false;
            });
    },
});

export const {
    setCurrentRoom, clearCurrentRoom,
    setPresenceUsers, addPresenceUser, removePresenceUser,
} = roomSlice.actions;
export default roomSlice.reducer;
