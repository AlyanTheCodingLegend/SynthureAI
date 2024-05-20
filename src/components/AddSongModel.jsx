import { ToastContainer, toast } from "react-toastify";
import supabase from "./ClientInstance";
import React, { useState, useEffect } from "react";
import toast_style from "./ToastStyle";
import { BeatLoader } from "react-spinners";
import { Link, useParams } from "react-router-dom";
import { IoMdClose } from "react-icons/io";

export default function AddSongModel () {
    const [isLoading, setIsLoading] = useState(true)
    const [songs, setSongs] = useState(null)

    const {username, playlistid} = useParams()
    
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
            <div className="min-w-screen min-h-screen overflow-x-hidden bg-blue-600 shadow-lg p-8">
                <div className="absolute flex flex-col top-0 right-0 m-2 text-red-700 text-lg font-bold focus:outline-none">
                    <Link to={`/${username}`}>
                        <IoMdClose size={40}/>
                    </Link>    
                </div>
                <div className="text-white text-4xl text-center">Add your uploaded songs to this playlist</div>
                <div className="mt-2 border-white border-t-2 mb-10"></div>
                {songs && songs.map((song, index) => (
                    <button key={index} onClick={()=>handleClick(song)}>{song.song_name}</button>
                ))}
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
            </div>
    )
}