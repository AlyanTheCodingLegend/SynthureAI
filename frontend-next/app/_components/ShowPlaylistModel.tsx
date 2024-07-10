"use client";

import { useEffect, useState } from "react";
import supabase from "./ClientInstance";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";
import { IoMdArrowBack } from "react-icons/io";
import { FaRegCirclePlay, FaRegCirclePause } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import "../_styles/NoScrollbar.css"
import useSongsFromPlaylist from "../_hooks/useSongsFromPlaylist";
import { AppDispatch } from "../_states/store";
import { useDispatch } from "react-redux";
import { setSongArray } from "../_states/songArraySlice";

type ShowPlaylistModelProps = {
    isOpen: boolean;
    playPlaylistID: number | null;
    setPlayPlaylistID: (value: number) => void;
    playlistid: number;
    setOpenPlaylist: (value: boolean) => void;
    isUniversallyPlaying: boolean;
    setIsUniversallyPlaying: (value: boolean) => void;
    setIndex: (value: number) => void;
    username: string;
    index: number;
}

export default function ShowPlaylistModel({isOpen, playPlaylistID, setPlayPlaylistID, playlistid, setOpenPlaylist, isUniversallyPlaying, setIsUniversallyPlaying, setIndex, username, index}: ShowPlaylistModelProps): JSX.Element {
    const [name, setName] = useState<string | null>(null)
    const [songnames, setSongnames] = useState<Array<string> | null>(null)
    const [images, setImages] = useState<Array<string>>([])
    const [artists, setArtists] = useState<Array<string>>([])
    const [indexes, setIndexes] = useState<Array<string>>([])
    const [backupSongs, setBackupSongs] = useState<Array<string>>([])

    const router = useRouter()

    const dispatch = useDispatch<AppDispatch>()

    const {data, error} = useSongsFromPlaylist(playlistid)

    useEffect(() => {
        if (error) {
            toast.error(error, toast_style)
        } else if (data) {
            setName(data.name)
            setSongnames(data.songnames)
            setImages(data.images)
            setArtists(data.artists)
            setIndexes(data.indexes)
            setBackupSongs(data.backupsongs)
        }
    }, [data, error])    
      
    const removeFromPlaylist = async (songindex: number) => {
        const {error} = await supabase.from("playlistsong_information").delete().eq('playlist_id', playlistid).eq('song_id', indexes[songindex])
        if (error) {
            toast.error(error.message, toast_style)
        } else {
            toast.success('Song removed from playlist!')
            if (songnames) {
                setSongnames(prevSongs => (prevSongs ?? []).filter(s => s !== songnames[songindex]))
                setImages(prevImages => prevImages.filter(s => s !== images[songindex]))
                setArtists(prevArtists => prevArtists.filter(s => s !== artists[songindex]))
                setIndexes(prevIndexes => prevIndexes.filter(s => s !== indexes[songindex]))
            }    
        }
    }

    const deletePlaylist = async () => {
        const {error} = await supabase.from("playlist_information").delete().eq('playlist_id', playlistid)
        if (error) {
            toast.error(error.message, toast_style)
            return
        } else {
            toast.success('Playlist deleted successfully!', toast_style)
            setOpenPlaylist(false)
        }
    }

    const handlePlay = (songindex: number) => {
        if (playPlaylistID!==playlistid) {
            setPlayPlaylistID(playlistid);
            if (isUniversallyPlaying===false) {
                dispatch(setSongArray(backupSongs))
                setIsUniversallyPlaying(true)
            }
        }
        setIndex(songindex)  
    }

    if (songnames===null) {
        return (
            <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-gradient-to-b from-black to-slate-700 w-screen min-h-screen overflow-x-hidden flex items-center justify-center`}>
                <BeatLoader size={30} color="purple"/>
            </div>
        )
    }

    return (
        <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-gradient-to-b from-black to-slate-700 w-screen min-h-screen overflow-x-hidden no-scrollbar`}>
            <div className="flex flex-row justify-end mt-4">
                <div className="flex flex-row w-2/3">
                        <div className="ml-4 text-4xl mb-1.5 text-white">{name}</div>
                </div> 
                <div className="w-1/3 flex flex-row justify-end items-center text-gray-400">
                    <div className="mr-2 mt-2 flex justify-end hover:text-white hover:cursor-pointer" onClick={()=>setOpenPlaylist(false)}><IoMdArrowBack size={40}/></div>
                    <div className="mt-2 mr-2 hover:text-white hover:cursor-pointer" onClick={() => router.push(`/${username}/${playlistid}/addsongs`)}><FaPlus size={25}/></div>
                    <div className="mt-2 mr-2 hover:text-white hover:cursor-pointer" onClick={() => deletePlaylist()}><MdDeleteForever size={30}/></div>
                </div>
            </div>  
            <div className="text-white text-2xl h-full -mt-1.5">
                <div className="mt-1 border-gray-400 border-t-2 mb-16"></div>
                <div  className="flex flex-col justify-center items-center">
                {songnames.length!==0 ? songnames.map((songname, songindex)=> (
                    <div key={songindex} className="relative group ml-4 mb-10 w-5/6">
                    <div className={(index===songindex && playPlaylistID===playlistid) ? "absolute -inset-0.5 bg-gradient-to-r from-green-700 to-green-400 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" : "absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-purple-700 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"}></div>
                    <div className="relative bg-black rounded-lg flex flex-row items-center text-gray-400 hover:text-white hover:cursor-pointer">
                        <div className="flex flex-row justify-start items-center h-24 w-4/5">
                            <img src={images[songindex]} className="h-full w-1/4 rounded-xl ml-2 pt-2 pb-2" alt="song cover" />
                            <div className="flex flex-col flex-wrap ml-4">
                                <div className="text-xl">{songname}</div>
                                <div className="text-sm">By: {artists[songindex]}</div>
                            </div>
                        </div>
                        <div className={(index===songindex && playPlaylistID===playlistid)? "flex flex-row justify-end text-white mr-4" : "flex flex-row justify-end text-green-500 hover:text-white mr-4"} onClick={() => handlePlay(songindex)}>
                            {(index===songindex && playPlaylistID===playlistid)? <FaRegCirclePause size={30}/> : <FaRegCirclePlay size={30} />}
                        </div>
                        <div className="flex flex-row justify-end text-green-500 hover:text-white" onClick={() => removeFromPlaylist(songindex)}>
                            <RiDeleteBin6Line size={30} />
                        </div>
                    </div>
                </div>
                )) : (
                    <div className="ml-4 text-lg">No songs in this playlist! Add some to start the vibe 😎</div>
                )}
                </div>
            </div>    
        </div>
    )
}