import "./App.css";
import HomePage from "./pages/UI/Home";
import LoginPage from "./pages/UI/Login";
import RegisterPage from "./pages/UI/Register";
import PostDetail from "./pages/UI/PostDetail";
import ExplorePage from "./pages/UI/Explore";
import ProfilesPage from "./pages/UI/Profiles";
import ProfilePage from "./pages/UI/Profile";
import UserProfilePage from "./pages/UI/UserProfile";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const router = createBrowserRouter([
  {
    path: "/register/",
    element: <RegisterPage />,
  },
  {
    path: "/login/",
    element:<LoginPage/>
  },
  {
    path:"/",
    element:<HomePage/>
  },
  {
    path: "/post/:postId",
    element: <PostDetail />,
  },
  {
    path: "/explore",
    element: <ExplorePage />,
  },
  {
    path: "/profiles",
    element: <ProfilesPage />,
  },
  {
    path: "/profile",
    element: <ProfilePage />,
  },
  {
    path: "/user/:username",
    element: <UserProfilePage />,
  }
]);
function App() {
 return( <>
    <RouterProvider router={router} />
    <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
    />
  </>)
}

export default App;
