import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8000",
});

// now there are two approaches of adding access token every fucking time but this is the professional one
//  we neeed to write interceptors to add access token on every reqest  and refresh   that token it gets expired somehow
// REQUEST INTERCEPTOR MIDDLEWARE
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      // browser does his job
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },

  // ON REJECTION
  (error) => {
    return Promise.reject(error);
  }
);
// response interceptors

API.interceptors.response.use(
  // check if you are getting access token  successfully
  // ON SUCCESS

  (response) => response,

  // if there's an error then you should check the error
  // ON REJECTION RUN THIS CODE
  async (error) => {
    const orignalRequest = error.config;
    // the error.config will return an object that contain's the problem
    if (error.response.status == 401 && !orignalRequest._retry) {
      //check if the error response is 401 means unauthorized and you have checked that the orignal response retry wont give you refresh token so you will get a new access token and retry with the orignal request for once without that you end up in infinite loop
      // this condition is used to check !orignalRequest._retry if you have tried to get access token or not if not then set it to true so that you wont stuck in infinite loop
      orignalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(
          `${API.defaults.baseURL}/api/token/refresh/`, // FIX (C): Added trailing slash
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;
        localStorage.setItem("access_token", access);
        orignalRequest.headers.Authorization = `Bearer ${access}`; // FIX (B): Added a space after "Bearer"
        return API(orignalRequest);
      } catch (refreshError) {
        console.error("token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login/";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const getPosts = async (page: number = 1, params?: Record<string, string>) => {
  const queryParams = new URLSearchParams({ page: page.toString(), ...params });
  const { data } = await API.get(`/posts/?${queryParams}`);
  return data.results || data;
};

export const register = async (userdata: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const { data } = await API.post("/register/", userdata);
    return data;
  } catch (error) {
    throw error;
  }
};
// login's logic
export const Login = async (usercredentials: {
  email: string;
  password: string;
}) => {
  try {
    const { data } = await API.post("/api/token/", usercredentials); // FIX (A): Added leading slash
    return data;
  } catch (e) {
    throw e;
  }
};

export const createPost = async (
  content: string,
  image?: File,
  video?: File
) => {
  const formData = new FormData();
  formData.append("content", content);
  if (image) {
    formData.append("image", image);
  }
  if (video) {
    formData.append("video", video);
  }
  try {
    const { data } = await API.post("/posts/", formData);
    return data;
  } catch (e) {
    throw e;
  }
};

export const deletePost = async (id: any) => {
  const res = await API.delete(`/post/${id}/`);
  return res;
};

export const updatePost = async (id: any, formData: FormData) => {
  try {
    const res = await API.put(`/post/${id}/`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res;
  } catch (err) {
    throw err;
  }
};

export const getLikedPosts = async (id: any) => {
  try {
    const res = await API.get(`/postlikes/${id}/`);
    return res;
  } catch (err) {
    throw err;
  }
};

export const createLikedPosts = async (id: any) => {
  try {
    const res = await API.post(`/postlikes/${id}/`);
    return res;
  } catch (err) {
    throw err;
  }
};

// Add these functions to your existing services

export const getPostById = async (id: string) => {
  try {
    const res = await API.get(`/post/${id}/`);
    return res;
  } catch (err) {
    throw err;
  }
};

export const getCommentsForPost = async (postId: any) => {
  try {
    const res = await API.get(`/comments/?post=${postId}`);
    return res;
  } catch (err) {
    throw err;
  }
};

export const createComment = async (commentData: {
  message: string;
  post: string;
}) => {
  try {
    const res = await API.post("/comments/", commentData);
    return res;
  } catch (err) {
    throw err;
  }
};

export const UpdateAPIComment = async (
  id: any,
  commentData: {
    message: string;
  }
) => {
  try {
    const res = await API.put(`/comment/${id}`, commentData);
    return res.data;
  } catch (e) {
    throw e;
  }
};

export const searchPosts = async (query: string) => {
  try {
    const res = await API.get(`/posts/search/?q=${query}`);
    return res.data.results || res.data;
  } catch (e) {
    throw e;
  }
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user_email");
  localStorage.removeItem("user_username");
  window.location.href = "/login/";
};

export const getUsers = async () => {
  try {
    const res = await API.get("/users/");
    return res.data;
  } catch (e) {
    throw e;
  }
};

export const getCurrentUser = async () => {
  try {
    const res = await API.get("/user/");
    return res.data;
  } catch (e) {
    throw e;
  }
};
