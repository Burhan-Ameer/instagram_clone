import { createSlice } from "@reduxjs/toolkit";

interface Post {
  id: string;
  content: string;
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
    removePost: (state, action: { payload: string| number}) => {
      state.items = state.items.filter((post) => post.id !== action.payload);
    },
  },
});
export const { addPost, removePost,setPosts } = postsSlice.actions;
export default postsSlice.reducer;
