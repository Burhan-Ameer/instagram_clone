import { createSlice } from "@reduxjs/toolkit";

interface Post {
  id: string;
  content: string;
  image?: string;
  video?: string;
  // Add other post properties as needed
}

interface PostsState {
  items: Post[];
}

const initialState: PostsState = {
  items: [],
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    setPosts: (state, action) => {
      state.items = action.payload;
    },
    addPost: (state, action: { payload: Post }) => {
      state.items.push(action.payload);
    },
    removePost: (state, action: { payload: string | number }) => {
      state.items = state.items.filter((post) => post.id !== action.payload);
    },
    updatePost: (state, action: { payload: Post }) => {
      const index = state.items.findIndex((post) => post.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...action.payload };
      }
    },
  },
});

export const { addPost, removePost, setPosts, updatePost } = postsSlice.actions;
export default postsSlice.reducer;
