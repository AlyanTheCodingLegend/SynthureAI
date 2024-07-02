"use client";

import { toast } from "react-toastify";
import supabase from "@/app/_components/ClientInstance";
import { useEffect, useState } from "react";
import toast_style from "@/app/_components/ToastStyle";
import { BeatLoader } from "react-spinners";
import { IoMdClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import "@/app/_styles/NoScrollbar.css";
import useFilteredSongs from "@/app/_hooks/useFilteredSongs";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function AddSongModel(): JSX.Element {
    const [songs, setSongs] = useState<Array<Song> | null>(null)

    const paramData = useParams<{username: string, playlistid: string}>()
    const username = paramData.username || ""
    const playlistid = paramData.playlistid || ""

    const {data: songData, error: songError} = useFilteredSongs(username, playlistid)
    
    useEffect(() => {
        if (songError) {
            toast.error(songError.message, toast_style)
        } else if (songData) {
            setSongs(songData)
        }
    }, [songData, songError])    
    
    const handleClick = async (song: Song) => {
        const {error} = await supabase.from('playlistsong_information').insert({playlist_id: playlistid, song_id: song.id})

        if (error) {
            toast.error(error.message, toast_style)
        } else {
            toast.success("Song added successfully!")
            setSongs(prevSongs => (prevSongs ?? []).filter(s => s.id !== song.id))    
        }
    }

    if (!songs) {
        return (
            <div className='flex w-screen h-screen justify-center bg-gradient-to-b from-black to-blue-600 items-center my-auto'>
                <BeatLoader size={30} color="purple"/>
            </div> 
        )
    }

    return (
        <div className="no-scrollbar min-w-screen min-h-screen overflow-hidden bg-gradient-to-b from-black to-blue-600 shadow-lg p-8">
            <div className="absolute flex flex-col top-0 right-0 m-2 text-red-700 hover:text-red-500 text-lg font-bold focus:outline-none">
                <Link href={`/${username}`}>
                    <IoMdClose size={40}/>
                </Link>    
            </div>
            <div className="text-white text-4xl text-center">Add your uploaded songs to this playlist</div>
            <div className="mt-2 border-white border-t-2 mb-10"></div>
            <div className="flex flex-col flex-wrap h-screen justify-start items-center">
            {songs.length!==0 ? ((songs.map((song, index) => (
                <div key={index} className="flex flex-row items-center w-2/3 h-1/6 bg-blue-600 rounded-lg mb-5 text-white">
                    <img src={song.image_path} className="h-2/3 w-1/5 rounded-lg ml-2" alt="song cover art"/>
                    <div className="flex flex-col flex-wrap ml-4">
                        <div className="text-xl">{song.song_name}</div>
                        <div className="text-sm">By: {song.artist_name}</div>
                    </div>
                    <div className="flex flex-row text-green-500 hover:text-white ml-auto mr-4 cursor-pointer" onClick={()=>handleClick(song)}><FaPlus size={30}/></div>
                </div>
            )))) : (
                <div className="text-white text-lg">No songs to add, try uploading some to add them to this playlist!</div>
            )}
            </div>
        </div>
    )
}