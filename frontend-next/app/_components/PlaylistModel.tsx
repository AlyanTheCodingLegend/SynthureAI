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
    const [playlistName, setPlaylistName] = useState<string>('')
    const [formData, setFormData] = useState<FormData>(new FormData())
    const [playid, setPlayid] = useState<number | null>(null)

    const router = useRouter()

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const name = event.target.value
        setPlaylistName(name) // Update playlistname state
        
        // Update formData correctly
        const newFormData = new FormData()
        newFormData.append('playlist_name', name)
        
        // Preserve any existing file if present
        const fileInput = document.getElementById('cover_image') as HTMLInputElement
        if (fileInput?.files?.[0]) {
            newFormData.append('cover_image', fileInput.files[0])
        }
        
        setFormData(newFormData)
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            // Create new FormData and preserve the playlist name
            const newFormData = new FormData()
            newFormData.append('cover_image', file)
            
            // Keep the existing playlist name if it exists
            if (playlistName) {
                newFormData.append('playlist_name', playlistName)
            }
            
            setFormData(newFormData)
        }
    }


    const handleClick = async () => {
        const data = await createPlaylist(username, formData)
        
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
            <div className="fixed inset-0 flex items-center justify-center z-[9999]" onClick={onClick}>
                <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm"></div>
                <div 
                    className="relative max-w-md w-full bg-[#1e1e1e] border border-[#533cb8] rounded-lg shadow-xl p-6 z-10"
                    onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating to parent
                >
                    <h2 className="text-white text-xl font-bold mb-4 text-center">Create Playlist</h2>
                    <div className="absolute top-2 right-2">
                        <button 
                            onClick={onClick} 
                            className="text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center transition-colors hover:bg-red-600 focus:outline-none"
                        >
                            <IoMdClose size={18}/>
                        </button>  
                    </div>
                    <input 
                        type="text" 
                        required
                        placeholder="Enter a playlist name" 
                        onChange={handleNameChange} 
                        className="w-full bg-[#262626] border border-[#333] rounded-lg px-3 py-2 mb-5 text-white focus:outline-none focus:border-[#7c4dff] transition-all hover:border-gray-500"
                    />
                    <input 
                        type="file"
                        accept="image/*"
                        required
                        name="cover_image"
                        id="cover_image"
                        placeholder="Add a cover image" 
                        onChange={handleFileChange} 
                        className="w-full bg-[#262626] border border-[#333] rounded-lg px-3 py-2 mb-5 text-white focus:outline-none focus:border-[#7c4dff] transition-all hover:border-gray-500"
                    />
                    <button 
                        className={playlistName === '' ? 
                            "w-full bg-gray-600 text-white font-bold py-3 px-4 rounded-lg focus:outline-none cursor-not-allowed" : 
                            "w-full bg-[#7c4dff] hover:bg-[#6a3aff] transition-colors text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"}
                        disabled={playlistName === ''}
                        onClick={handleClick}
                    >
                        Create Playlist
                    </button>
                </div>
            </div>
        </div>
    )
}