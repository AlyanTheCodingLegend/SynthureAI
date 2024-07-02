"use client";

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "react-toastify"
import toast_style from "@/app/_components/ToastStyle"
import { IoMdClose } from "react-icons/io"
import { FaPlus } from "react-icons/fa6"
import { BeatLoader } from "react-spinners"
import useSongs from "@/app/_hooks/useSongs"
import { useParams } from "next/navigation"

export default function AIGeneration(): JSX.Element {
    const [songs, setSongs] = useState<Array<Song>>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const paramData = useParams<{username: string}>()
    const username = paramData.username || ""
    
    const {data: songData, error: songError} = useSongs(username)

    useEffect(() => {
        if (songError) {
            toast.error(songError.message, toast_style)
        } else if (songData) {
            setSongs(songData)
        }
        setIsLoading(false)
    }, [songData, songError]) 

    const handleClick = async (songID: number) => {
        console.log(songID)   
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
                <Link href={`/${username}`}>
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
                    <div className="flex flex-row text-green-500 hover:text-white ml-auto mr-4 hover:cursor-pointer" onClick={()=>handleClick(song.id)}><FaPlus size={30}/></div>
                </div>
            )))) : (
                <div className="text-white text-lg">No songs to add, try uploading some to add them to this playlist!</div>
            )) : (
                <div className="text-white text-lg">Loading...</div>
            )}
            </div>
        </div>
    )
}