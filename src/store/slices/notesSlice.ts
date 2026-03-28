import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { NoteVersion } from "@/types";

interface NotesState {
    content: string;
    lastEditedBy: string | null;
    isSaving: boolean;
    isDirty: boolean;           // unsaved local changes
    versions: NoteVersion[];
    showHistory: boolean;
}

const initialState: NotesState = {
    content: "",
    lastEditedBy: null,
    isSaving: false,
    isDirty: false,
    versions: [],
    showHistory: false,
};

const notesSlice = createSlice({
    name: "notes",
    initialState,
    reducers: {
        setNoteContent(state, action: PayloadAction<string>) {
            state.content = action.payload;
            state.isDirty = false;
        },
        // Local edit (user typing) — marks dirty but doesn't broadcast yet
        localEdit(state, action: PayloadAction<string>) {
            state.content = action.payload;
            state.isDirty = true;
        },
        // Remote update received from socket (another user edited)
        remoteEdit(state, action: PayloadAction<{ content: string; editedBy: string }>) {
            state.content = action.payload.content;
            state.lastEditedBy = action.payload.editedBy;
            state.isDirty = false;
        },
        setIsSaving(state, action: PayloadAction<boolean>) {
            state.isSaving = action.payload;
            if (!action.payload) state.isDirty = false;
        },
        setVersions(state, action: PayloadAction<NoteVersion[]>) {
            state.versions = action.payload;
        },
        toggleHistory(state) {
            state.showHistory = !state.showHistory;
        },
        clearNotes(state) {
            state.content = "";
            state.isDirty = false;
            state.versions = [];
            state.showHistory = false;
        },
    },
});

export const {
    setNoteContent, localEdit, remoteEdit,
    setIsSaving, setVersions, toggleHistory, clearNotes,
} = notesSlice.actions;
export default notesSlice.reducer;
