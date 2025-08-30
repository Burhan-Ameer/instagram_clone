import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
  },
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
    return config;
  },

  // ON REJECTION
  (error) => {
    Promise.reject(error);
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
          `${API.defaults.baseURL}/api/token/refresh`,
          {
            refresh: refreshToken,
          }
        );

        const { access } = response.data;
        localStorage.setItem("access_token", access);
        orignalRequest.headers.Authorization = `Bearer${access}`;
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

export const getPosts = async () => {
  const { data } = await API.get("/posts");
  return data;
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
    const { data } = await API.post("api/token/", usercredentials);
    return data;
  } catch (e) {
    throw e;
  }
};
