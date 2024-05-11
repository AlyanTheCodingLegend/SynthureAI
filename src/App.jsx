import React from "react";
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import { AuthUser, CreateUser } from "./components/UserAuthModel";
import Tester from "./components/Tester";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function App() {
  const router=createBrowserRouter([
    {
      path: '/',
      element: <Player username='AlyanDaGoat'/>
    },
    {
      path: '/login',
      element: <AuthUser />
    },
    {
      path: '/signup',
      element: <CreateUser />
    }
  ])
  return (
    <RouterProvider router={router}/>
  )
}

export default App;
