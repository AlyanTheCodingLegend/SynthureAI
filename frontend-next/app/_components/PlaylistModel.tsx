"use client";

import React, { useEffect, useState, type JSX } from "react";
import { useRouter } from "next/navigation"
import { IoMdClose } from "react-icons/io";
import { createPlaylist } from "../_actions/_actions";

type PlaylistModelProps = {
    username: string;
    onClick: () => void;
}

export default function PlaylistModel ({username, onClick}: PlaylistModelProps): JSX.Element {
    const [playlistname, setPlaylistname] = useState<string>('')
    const [playid, setPlayid] = useState<number | null>(null)

    const router = useRouter()

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPlaylistname(event.target.value)
    }

    const handleClick = async () => {
        const data = await createPlaylist(username, playlistname)
        
        if (data) {
            setPlayid(data[0].playlist_id)
        }    
    }

    useEffect(() => {
        if (playid) {
            router.push(`/${username}/${playid}/addsongs`)
        }
    // eslint-disable-next-line    
    }, [playid])    

    return (
        <div>
            <div className="relative max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
                <div className="absolute top-0 right-0 m-2 text-red-700 text-lg font-bold focus:outline-none">
                    <button onClick={onClick}>
                        <IoMdClose size={25}/>
                    </button>  
                </div>
                <input 
                    type="text" 
                    placeholder="Enter a playlist name" 
                    onChange={handleNameChange} 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                />
                <button 
                    className={playlistname === '' ? "w-full bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-not-allowed" : "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                    disabled={playlistname === ''}
                    onClick={handleClick}
                >
                    Create Playlist
                </button>
            </div>
            
        </div>

    )
} 