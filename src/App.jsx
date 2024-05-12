import React from "react";
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import { AuthUser, CreateUser } from "./components/UserAuthModel";
import Tester from "./components/Tester";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddSongModel from "./components/AddSongModel";
import PlaylistModel from "./components/PlaylistModel";

function App() {
  const router=createBrowserRouter([
    {
      path: '/',
      element: <Tester />
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
      path: '/songuploader',
      element: <AddSongModel />
    },
    {
      path: '/createplaylist',
      element: <PlaylistModel />
    }
  ])
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
