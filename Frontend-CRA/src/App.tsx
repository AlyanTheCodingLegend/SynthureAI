import { AuthUser, CreateUser } from "./components/UserAuthModel";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddSongModel from "./components/AddSongModel";
import { ProfilePage } from "./components/ProfilePage";
import Home from "./components/Home";
import AIGeneration from "./components/AIGeneration";
import Navigator from "./components/Navigator";
import { ToastContainer } from "react-toastify";

function App(): JSX.Element {
  const router=createBrowserRouter([
    {
      path: '/',
      element: <Navigator />
    },
    {
      path: '/:username',
      element: <Home />
    },
    {
      path: '/login',
      element: <AuthUser />
    },
    {
      path: '/signup',
      element: <CreateUser />
    },
    {
      path: '/:username/:playlistid/addsongs',
      element: <AddSongModel />
    },
    {
      path: '/profile/:username',
      element: <ProfilePage />
    },
    {
      path: '/:username/aigen',
      element: <AIGeneration />
    }
  ]
  // ,{
  //   basename: '/SynthureAI'
  // }
  )
  return (
    <>
      <RouterProvider router={router}/>
      <ToastContainer containerId={1} position="top-right" autoClose={1000} hideProgressBar={false} theme='dark'/>
    </>
  )
}

export default App;
