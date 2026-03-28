import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Message } from "@/types";

interface TypingUser {
    userId: string;
    name: string;
}

interface ChatState {
    messages: Message[];
    typingUsers: TypingUser[];
    hasMore: boolean;
    loading: boolean;
}

const initialState: ChatState = {
    messages: [],
    typingUsers: [],
    hasMore: false,
    loading: false,
};

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setMessages(state, action: PayloadAction<{ messages: Message[]; hasMore: boolean }>) {
            state.messages = action.payload.messages;
            state.hasMore = action.payload.hasMore;
            state.loading = false;
        },
        prependMessages(state, action: PayloadAction<{ messages: Message[]; hasMore: boolean }>) {
            // For loading older messages (pagination)
            state.messages = [...action.payload.messages, ...state.messages];
            state.hasMore = action.payload.hasMore;
        },
        addMessage(state, action: PayloadAction<Message>) {
            state.messages.push(action.payload);
        },
        updateReactions(state, action: PayloadAction<{ messageId: string; reactions: Record<string, string[]> }>) {
            const msg = state.messages.find(m => m.id === action.payload.messageId || m._id === action.payload.messageId);
            if (msg) msg.reactions = action.payload.reactions;
        },
        setTypingUser(state, action: PayloadAction<{ userId: string; name: string; isTyping: boolean }>) {
            const { userId, name, isTyping } = action.payload;
            if (isTyping) {
                const exists = state.typingUsers.find(u => u.userId === userId);
                if (!exists) state.typingUsers.push({ userId, name });
            } else {
                state.typingUsers = state.typingUsers.filter(u => u.userId !== userId);
            }
        },
        clearChat(state) {
            state.messages = [];
            state.typingUsers = [];
            state.hasMore = false;
        },
        setChatLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
    },
});

export const {
    setMessages, prependMessages, addMessage,
    updateReactions, setTypingUser, clearChat, setChatLoading,
} = chatSlice.actions;
export default chatSlice.reducer;
