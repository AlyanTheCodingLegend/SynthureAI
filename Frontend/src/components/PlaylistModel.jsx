import React, { useEffect, useState } from "react"
import supabase from "./ClientInstance"
import { ToastContainer, toast } from "react-toastify"
import toast_style from "./ToastStyle"
import { useNavigate } from "react-router-dom"
import { IoMdClose } from "react-icons/io";

export default function PlaylistModel ({username, onClick}) {
    const [playlistname, setPlaylistname] = useState('')
    const [playid, setPlayid] = useState(null)

    const navigate = useNavigate()

    const handleNameChange = (event) => {
        setPlaylistname(event.target.value)
    }

    const handleClick = async () => {
        const {data, error} = await supabase.from('playlist_information').insert({created_by: username, playlist_name: playlistname}).select("*")
        if (error) {
            toast.error(error.message, toast_style)
        } else {
            setPlayid(data[0].playlist_id)
        }
    }

    useEffect(() => {
        if (playid) {
            navigate(`/${username}/${playid}/addsongs`)
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
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
        </div>

    )
} 