import { createSlice, type PayloadAction } from "@reduxjs/toolkit";


interface Comment {
  id: string;
  text: string;
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
    removeComments:(state,action)=>{
        state.items = state.items.filter((item) => item.id !== action.payload.id);
    }
  },
});