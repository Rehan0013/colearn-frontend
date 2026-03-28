import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { roomApi } from "@/lib/api";
import type { Room, PresenceUser } from "@/types";

interface RoomState {
    list: Room[];
    current: Room | null;
    presenceUsers: PresenceUser[];
    loading: boolean;
    error: string | null;
    isConnected: boolean;
}

const initialState: RoomState = {
    list: [],
    current: null,
    presenceUsers: [],
    loading: false,
    error: null,
    isConnected: false,
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

export const updateRoom = createAsyncThunk(
    "room/update",
    async ({ roomId, data }: { roomId: string; data: Partial<Room> }, { rejectWithValue }) => {
        try {
            const res = await roomApi.patch(`/api/rooms/${roomId}`, data);
            return res.data.room as Room;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to update room");
        }
    }
);

export const deleteRoom = createAsyncThunk(
    "room/delete",
    async (roomId: string, { rejectWithValue }) => {
        try {
            await roomApi.delete(`/api/rooms/${roomId}`);
            return roomId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message || "Failed to delete room");
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
        setSocketConnected(state, action: PayloadAction<boolean>) {
            state.isConnected = action.payload;
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
            .addCase(fetchMyRooms.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyRooms.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchMyRooms.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(fetchRoomById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoomById.fulfilled, (state, action) => {
                state.current = action.payload;
                state.loading = false;
            })
            .addCase(fetchRoomById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateRoom.fulfilled, (state, action) => {
                state.current = action.payload;
                state.list = state.list.map(r => r._id === action.payload._id ? action.payload : r);
            })
            .addCase(deleteRoom.fulfilled, (state, action) => {
                if (state.current?._id === action.payload) state.current = null;
                state.list = state.list.filter(r => r._id !== action.payload);
            });
    },
});

export const {
    setCurrentRoom, clearCurrentRoom,
    setPresenceUsers, addPresenceUser, removePresenceUser,
    setSocketConnected,
} = roomSlice.actions;
export default roomSlice.reducer;
