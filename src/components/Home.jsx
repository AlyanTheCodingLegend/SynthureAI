import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Player from "./Player";
import Layout from "./Layout";
import { useNavigate, useParams } from "react-router-dom";
import ShowPlaylistModel from "./ShowPlaylistModel";
import { BounceLoader } from "react-spinners";
import supabase from "./ClientInstance";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";

export default function Home() {
    const [isOpen, setIsOpen] = useState(true);
    const [openPlaylist, setOpenPlaylist] = useState(false)
    const [playlistID, setPlaylistID] = useState(null)
    const [songArray, setSongArray] = useState([])
    const [songNameArray, setSongNameArray] = useState([])
    const [imageArray, setImageArray] = useState([])
    const [indexArray, setIndexArray] = useState([])
    const [index, setIndex] = useState(0)

    const toggleSidebar = () => setIsOpen(!isOpen);

    const {username} = useParams()

    return (
        <div className="flex h-screen overflow-none">
            <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar}/>
            {openPlaylist ? <ShowPlaylistModel isOpen={isOpen} playlistid={playlistID} setOpenPlaylist={setOpenPlaylist} setSongArray={setSongArray} setSongNameArray={setSongNameArray} setImageArray={setImageArray} setIndexArray={setIndexArray} setIndex={setIndex} username={username}/> : <Layout isOpen={isOpen} username={username} setOpenPlaylist={setOpenPlaylist} setPlaylistID={setPlaylistID}/>}
            <Player isOpen={isOpen} songs={songArray} songNames={songNameArray} images={imageArray} indexes={indexArray} index={index} setIndex={setIndex}/>
        </div>    
    )
}