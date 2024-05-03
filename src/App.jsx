import './App.css';
import React from "react";
import Player from './components/Player';
import SongUploadModel from './components/SongUploadModel';
import { AuthUser } from './components/UserAuthModel';
import Tester from './components/Tester';

function App() {
  return (
    <AuthUser />
  )
}

export default App;
