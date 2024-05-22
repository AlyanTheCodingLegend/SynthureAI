import React, { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import supabase from "./ClientInstance"
import { ToastContainer, toast } from "react-toastify"
import toast_style from "./ToastStyle"
import { IoMdClose } from "react-icons/io"
import { FaPlus } from "react-icons/fa6"
import { BeatLoader } from "react-spinners"
import axios from "axios"

export default function AIGeneration() {
    const [songs, setSongs] = useState(null)
    const [songindex, setSongindex] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const {username} = useParams()
    
    useEffect(() => {
        async function loadSongs() {   
            setIsLoading(true)
            try {
                const {data, error} = await supabase.from('song_information').select('*').eq('uploaded_by', username)
                if (error) throw error

                setSongs(data)
            } catch (error) {
                toast.error(error.message, toast_style)
            } finally {
                setIsLoading(false)
            }   
        }

        loadSongs()
    }, [username])

    const handleClick = async (songID) => {
        try{
            setIsLoading(true)
            const res = await axios.post('http://localhost:5000/song_id', {song_id: songID}, {headers: {'Content-Type': 'application/json'}})
            toast.success("Song has been created successfully, you can add it to any of your playlists now!", toast_style)
        } catch (err) {
            toast.error("Sorry, something went wrong while creating your song!", toast_style)
        } finally {
            setIsLoading(false)
        }    
    }
    
    if (isLoading) {
        return (
            <div className='flex w-screen h-screen justify-center bg-gradient-to-b from-black to-purple-600 items-center my-auto'>
                <BeatLoader size={30} color="purple"/>
            </div>
        )
    }

    return (
        <div className="min-w-screen min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-purple-600 shadow-lg p-8">
            <div className="absolute flex flex-col top-0 right-0 m-2 text-red-700 hover:text-red-500 text-lg font-bold focus:outline-none">
                <Link to={`/${username}`}>
                    <IoMdClose size={40}/>
                </Link>    
            </div>
            <div className="text-white text-2xl text-center">Select the song to convert it to an AI-generated song 😍</div>
            <div className="mt-2 border-white border-t-2 mb-10"></div>
            <div className="flex flex-col flex-wrap h-screen justify-start items-center">
            {songs!==null ? (songs.length!==0 ? ((songs.map((song, index) => (
                <div key={index} className="flex flex-row items-center w-2/3 h-1/6 bg-blue-600 rounded-lg mb-5 text-white">
                    <img src={song.image_path} className="h-2/3 w-1/5 rounded-lg ml-2" alt="song cover art"/>
                    <div className="flex flex-col flex-wrap ml-4">
                        <div className="text-xl">{song.song_name}</div>
                        <div className="text-sm">By: {song.artist_name}</div>
                    </div>
                    <div className="flex flex-row text-green-500 hover:text-white ml-auto mr-4" onClick={()=>handleClick(song.id)}><FaPlus size={30}/></div>
                </div>
            )))) : (
                <div className="text-white text-lg">No songs to add, try uploading some to add them to this playlist!</div>
            )) : (
                <div className="text-white text-lg">Loading...</div>
            )}
            </div>
            <ToastContainer position="top-right" autoClose={700} hideProgressBar={true} closeOnClick pauseOnHover draggable theme='dark'/>
        </div>
    )
}