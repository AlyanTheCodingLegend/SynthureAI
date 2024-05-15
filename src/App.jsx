import React from "react";
import Player from './components/Player';
import { AuthUser, CreateUser } from "./components/UserAuthModel";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddSongModel from "./components/AddSongModel";
import PlaylistModel from "./components/PlaylistModel";
import { ProfilePage } from "./components/ProfilePage";
import SongUploadModel from "./components/SongUploadModel";
import Sidebar from "./components/Sidebar";

function App() {
  const router=createBrowserRouter([
    {
      path: '/:username',
      element: <Sidebar><Player /></Sidebar>
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
      path: '/addsong/:username/:playlistid',
      element: <AddSongModel />
    },
    {
      path: '/playlists/:username',
      element: <PlaylistModel />
    },
    {
      path: '/profile/:username',
      element: <ProfilePage />
    },
    {
      path: '/songuploader/:username',
      element: <SongUploadModel />
    },
    {
      path: '/sidebar/:username',
      element: <Sidebar />
    }
  ])
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
