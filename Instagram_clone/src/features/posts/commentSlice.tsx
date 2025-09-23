import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


interface Comment {
  id: string;
  user: string;  // Match API
  message: string;  // Changed from 'text' to 'message' for consistency
  created_at: string;
}

interface CommentState {
  items: Comment[];
}

const initialState: CommentState = { items: [] };

export const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    setcomments: (state, action: PayloadAction<Comment[]>) => {
      state.items = action.payload;
    },
    addComments: (state, action: PayloadAction<Comment>) => {
      state.items.push(action.payload);
    },
    removeComments: (state, action: PayloadAction<{ id: string }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
    updateComment: (state, action: PayloadAction<Comment>) => {
      const index = state.items.findIndex((item) => item.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
    },
  },
});

export const { setcomments, addComments, removeComments, updateComment } = commentSlice.actions