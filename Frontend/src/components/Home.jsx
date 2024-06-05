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
    const [imageArray, setImageArray] = useState([])
    const [index, setIndex] = useState(0)
    const [signOut, setSignOut] = useState(false)
    const [playPlaylistID, setPlayPlaylistID] = useState(null)
    const [isUniversallyPlaying, setIsUniversallyPlaying] = useState(false)

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
            {openPlaylist ? <ShowPlaylistModel isOpen={isOpen} playPlaylistID={playPlaylistID} setPlayPlaylistID={setPlayPlaylistID} playlistid={playlistID} setOpenPlaylist={setOpenPlaylist} isUniversallyPlaying={isUniversallyPlaying} setIsUniversallyPlaying={setIsUniversallyPlaying} setSongArray={setSongArray} setImageArray={setImageArray} setIndex={setIndex} username={username} index={index}/> : <Layout isOpen={isOpen} username={username} setOpenPlaylist={setOpenPlaylist} setPlaylistID={setPlaylistID}/>}
            <Player isOpen={isOpen} songs={songArray} images={imageArray} index={index} setIndex={setIndex}/>
        </div>    
    )
}