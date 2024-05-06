import { ToastContainer, toast } from "react-toastify";
import supabase from "./ClientInstance";
import React, { useState, useEffect } from "react";
import toast_style from "./ToastStyle";
import { BeatLoader } from "react-spinners";

export default function AddSongModel ({username, playlistid, onClose}) {
    const [isLoading, setIsLoading] = useState(true)
    const [songs, setSongs] = useState(null)
    
    useEffect(() => {
        const loadSongs = async () => {
            try {
                const {data, error} = await supabase.from('song_information').select('*').eq('uploaded_by', username)
                if (error) throw error

                setSongs(data)

                setIsLoading(false)
            } catch (error) {
                toast.error(error.message, toast_style)
            }    
        }

        loadSongs()
    // eslint-disable-next-line    
    }, [])    

    const handleClick = async (song) => {
        const {error} = await supabase.from('playlistsong_information').insert({playlist_id: playlistid, song_id: song.id})

        if (error) {
            toast.error(error.message, toast_style)
        } else {
            toast.success("Song added successfully!", toast_style)
        }
    }

    if (isLoading) {
        return (
            <div className='flex w-full h-full justify-center items-center my-auto'>
                <BeatLoader size={30} color="lightblue"/>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
            <div className="absolute top-0 right-0 m-2 text-red-700 text-lg font-bold focus:outline-none">
                    <button onClick={onClose}>
                        X
                    </button>
                </div>
            <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
                {songs && songs.map((song, index) => (
                    <button key={index} onClick={()=>handleClick(song)}>{song.song_name}</button>
                ))}
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
            </div>
        </div>
    )
}