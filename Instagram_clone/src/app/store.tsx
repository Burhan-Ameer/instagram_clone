import { configureStore } from "@reduxjs/toolkit";
import postsReducer from "../features/posts/postSlice";
import { commentSlice } from "@/features/posts/commentSlice";

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments:commentSlice.reducer,
  },
});

