import React from "react";
import { AuthUser, CreateUser } from "./components/UserAuthModel";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddSongModel from "./components/AddSongModel";
import { ProfilePage } from "./components/ProfilePage";
import Home from "./components/Home";
import ShowPlaylistModel from "./components/ShowPlaylistModel";

function App() {
  const router=createBrowserRouter([
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
      path: '/:username/playlists/:playlistid',
      element: <ShowPlaylistModel />
    },
    {
      path: '/profile/:username',
      element: <ProfilePage />
    },
  ])
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
