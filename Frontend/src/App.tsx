import { AuthUser, CreateUser } from "./components/UserAuthModel";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddSongModel from "./components/AddSongModel";
import { ProfilePage } from "./components/ProfilePage";
import Home from "./components/Home";
import AIGeneration from "./components/AIGeneration";
import Navigator from "./components/Navigator";

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
  ])
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
