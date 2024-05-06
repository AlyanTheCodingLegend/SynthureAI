import React, { useState } from "react"
import supabase from "./ClientInstance"
import { ToastContainer, toast } from "react-toastify"
import toast_style from "./ToastStyle"
import AddSongModel from "./AddSongModel"

export default function PlaylistModel ({username, onClose}) {
    const [playlistname, setPlaylistname] = useState('')
    const [playid, setPlayid] = useState(null)

    const handleNameChange = (event) => {
        setPlaylistname(event.target.value)
    }

    const handleClick = async () => {
        const {error} = await supabase.from('playlist_information').insert({created_by: username, playlist_name: playlistname})
        if (error) {
            toast.error(error.message, toast_style)
        } else {

            const {data, error: errorTwo} = await supabase.from('playlist_information').select('playlist_id').eq('playlist_name', playlistname)

            if (errorTwo) {
                toast.error(errorTwo.message, toast_style)
            } else {
                setPlayid(data[0].playlist_id)
            }
        }

    }

    if (playid) {
        return (
            <AddSongModel username={username} playlistid={playid} onClose={()=>setPlayid(null)}/>
        )
    }

    return (
        <div>
            <div className="relative max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
                <div className="absolute top-0 right-0 m-2 text-red-700 text-lg font-bold focus:outline-none">
                    <button onClick={onClose}>X</button>
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
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
        </div>

    )
} 