import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Player from "./Player";
import Layout from "./Layout";
import { useParams } from "react-router-dom";
import ShowPlaylistModel from "./ShowPlaylistModel";
import { BounceLoader } from "react-spinners";

export default function Home() {
    const [isOpen, setIsOpen] = useState(true);
    const [openPlaylist, setOpenPlaylist] = useState(false)
    const [playlistID, setPlaylistID] = useState(null)
    const [songArray, setSongArray] = useState([])
    const [songNameArray, setSongNameArray] = useState([])
    const [imageArray, setImageArray] = useState([])
    const [indexArray, setIndexArray] = useState([])
    const [index, setIndex] = useState(0)
    const [signOut, setSignOut] = useState(false)

    const toggleSidebar = () => setIsOpen(!isOpen);

    const {username} = useParams()

    if (signOut) {
        return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700 z-40">
          <div className="text-center">
              <BounceLoader color="#36d7b7" />
          </div>
          <div className='mt-5 text-xl text-white'>Signing you out...</div>
        </div>
        )
    }

    return (
        <div className="flex h-screen overflow-none">
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} signOut={signOut} setSignOut={setSignOut}/>
            {openPlaylist ? <ShowPlaylistModel isOpen={isOpen} playlistid={playlistID} setOpenPlaylist={setOpenPlaylist} setSongArray={setSongArray} setSongNameArray={setSongNameArray} setImageArray={setImageArray} setIndexArray={setIndexArray} setIndex={setIndex} username={username} index={index}/> : <Layout isOpen={isOpen} username={username} setOpenPlaylist={setOpenPlaylist} setPlaylistID={setPlaylistID}/>}
            <Player isOpen={isOpen} songs={songArray} songNames={songNameArray} images={imageArray} indexes={indexArray} index={index} setIndex={setIndex}/>
        </div>    
    )
}