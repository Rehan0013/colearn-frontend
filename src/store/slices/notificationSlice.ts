import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface NotificationItem {
    id: string;
    type: "info" | "success" | "warning" | "error";
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    link?: string;
}

interface NotificationState {
    items: NotificationItem[];
    unreadCount: number;
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
};

const notificationSlice = createSlice({
    name: "notification",
    initialState,
    reducers: {
        addNotification: (state, action: PayloadAction<Omit<NotificationItem, "id" | "timestamp" | "read">>) => {
            const newItem: NotificationItem = {
                ...action.payload,
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date().toISOString(),
                read: false,
            };
            state.items.unshift(newItem);
            state.unreadCount += 1;
            // Keep only latest 20 notifications
            if (state.items.length > 20) {
                state.items = state.items.slice(0, 20);
            }
        },
        markAsRead: (state, action: PayloadAction<string>) => {
            const item = state.items.find((i) => i.id === action.payload);
            if (item && !item.read) {
                item.read = true;
                state.unreadCount -= 1;
            }
        },
        markAllAsRead: (state) => {
            state.items.forEach((i) => (i.read = true));
            state.unreadCount = 0;
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            const item = state.items.find((i) => i.id === action.payload);
            if (item && !item.read) state.unreadCount -= 1;
            state.items = state.items.filter((i) => i.id !== action.payload);
        },
        clearAll: (state) => {
            state.items = [];
            state.unreadCount = 0;
        },
    },
});

export const { addNotification, markAsRead, markAllAsRead, removeNotification, clearAll } = notificationSlice.actions;
export default notificationSlice.reducer;
