"use client";

import { useEffect, useState, type JSX } from "react";
import { toast } from "react-toastify";
import toast_style from "@/app/_components/ToastStyle";
import { IoMdArrowBack } from "react-icons/io";
import { FaRegCirclePlay, FaRegCirclePause } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useParams, useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import "@/app/_styles/NoScrollbar.css"
import useSongsFromPlaylist from "@/app/_hooks/useSongsFromPlaylist";
import { AppDispatch, RootState } from "@/app/_states/store";
import { useDispatch, useSelector } from "react-redux";
import { setIndex, setIsUniversallyPlaying, setOpenPlaylist, setPlayPlaylistID, setSongArray } from "@/app/_states/songArraySlice";
import Link from "next/link";
import { deletePlaylistServer, removeFromPlaylistServer } from "./actions";

export default function ShowPlaylistModel(): JSX.Element {
    const [name, setName] = useState<string | null>(null)
    const [songnames, setSongnames] = useState<Array<string> | null>(null)
    const [images, setImages] = useState<Array<string>>([])
    const [artists, setArtists] = useState<Array<string>>([])
    const [indexes, setIndexes] = useState<Array<number>>([])
    const [backupSongs, setBackupSongs] = useState<Array<string>>([])

    const router = useRouter()

    const isOpen = useSelector((state: RootState) => state.songs.isOpen)
    const playPlaylistID = useSelector((state: RootState) => state.songs.playPlaylistID)
    const isUniversallyPlaying = useSelector((state: RootState) => state.songs.isUniversallyPlaying)
    const index = useSelector((state: RootState) => state.songs.index)

    const params = useParams<{username: string, playlistid: string}>()
    const username = params.username
    const playlistid = parseInt(params.playlistid)

    const dispatch = useDispatch<AppDispatch>()

    const {data, error} = useSongsFromPlaylist(playlistid, username)

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
        let removed = await removeFromPlaylistServer(playlistid, indexes[songindex])
        if (removed) {
            if (songnames) {
                setSongnames(prevSongs => (prevSongs ?? []).filter(s => s !== songnames[songindex]))
                setImages(prevImages => prevImages.filter(s => s !== images[songindex]))
                setArtists(prevArtists => prevArtists.filter(s => s !== artists[songindex]))
                setIndexes(prevIndexes => prevIndexes.filter(s => s !== indexes[songindex]))
            }  
        }
    }

    const deletePlaylist = async () => {
        let deleted = await deletePlaylistServer(playlistid)
        if (deleted) {
            dispatch(setOpenPlaylist(false))
        }
    }

    const handlePlay = (songindex: number) => {
        if (playPlaylistID !== playlistid) {
            dispatch(setPlayPlaylistID(playlistid));
            if (isUniversallyPlaying === false) {
                dispatch(setSongArray(backupSongs))
                dispatch(setIsUniversallyPlaying(true))
            }
        }
        dispatch(setIndex(songindex))  
    }

    const handleGoBack = () => {
        dispatch(setOpenPlaylist(false))
    }

    const handleAddSongs = () => {
        if (playlistid === Number(process.env.NEXT_PUBLIC_MYSONGS_ID)) {
            toast.warning("This is an automated playlist, no need to add songs to it!", toast_style)
        } else {    
            router.push(`/${username}/${playlistid}/addsongs`)
        }    
    }

    const handleDeletePlaylist = () => {
        if (playlistid === Number(process.env.NEXT_PUBLIC_MYSONGS_ID)) {
            toast.warning("This is an automated playlist, you can't delete it!", toast_style)
        } else {
            deletePlaylist()
        }    
    }

    if (songnames === null) {
        return (
            <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-[#0F0F0F] w-screen min-h-screen overflow-x-hidden flex items-center justify-center`}>
                <BeatLoader size={30} color="#9333EA"/>
            </div>
        )
    }

    return (
        <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-[#0F0F0F] w-screen min-h-screen overflow-x-hidden no-scrollbar p-5`}>
            <div className="container max-w-[1000px] mx-auto">
                <div className="header flex justify-between items-center mb-6">
                    <h1 className="text-[36px] font-bold text-white">{name || "My Songs"}</h1>
                    <div className="actions flex gap-4 bg-[rgba(26,26,26,0.7)] backdrop-blur-md p-2 px-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
                        <Link href={`/${username}`}>
                            <button className="action-btn relative overflow-hidden w-10 h-10 flex items-center justify-center text-[18px] bg-transparent border-none text-white transition-all hover:text-[#9333EA]" onClick={handleGoBack}>
                                <IoMdArrowBack />
                            </button>
                        </Link>
                        <button 
                            className="action-btn relative overflow-hidden w-10 h-10 flex items-center justify-center text-[18px] bg-transparent border-none text-white transition-all hover:text-[#9333EA]" 
                            onClick={handleAddSongs}
                        >
                            <FaPlus />
                        </button>
                        <button 
                            className="action-btn delete relative overflow-hidden w-10 h-10 flex items-center justify-center text-[18px] bg-transparent border-none text-white transition-all hover:text-[#E53E3E]" 
                            onClick={handleDeletePlaylist}
                        >
                            <MdDeleteForever />
                        </button>
                    </div>
                </div>
                
                <div className="songs-list flex flex-col gap-3">
                    {songnames && songnames.length > 0 ? (
                        songnames.map((songname, songindex) => (
                            <div key={songindex} className="song-item flex items-center bg-[#1A1A1A] rounded-xl overflow-hidden transition-all duration-300 border border-[#2A2A2A] relative hover:bg-[#222222] hover:border-[rgba(147,51,234,0.3)] hover:shadow-lg hover:scale-[1.01]">
                                <div className="song-thumbnail w-[100px] h-[100px] bg-[#2A2A2A] flex items-center justify-center text-[#777] text-xs leading-tight text-center">
                                    <img src={images[songindex]} alt={songname} className="w-full h-full object-cover" />
                                </div>
                                <div className="song-info flex-1 px-5">
                                    <h3 className="song-title text-[22px] font-semibold mb-1.5 text-white">{songname}</h3>
                                    <p className="song-artist text-[16px] text-[#A0AEC0] m-0">By: {artists[songindex]}</p>
                                </div>
                                
                                <div className="wave-visualizer hidden md:flex items-end h-[30px] gap-[3px] mr-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    {(index === songindex && playPlaylistID === playlistid) && (
                                        <>
                                            <div className="wave-bar w-[3px] bg-[#9333EA] rounded-[1px] h-[30%] animate-[wave_0.5s_infinite_alternate]"></div>
                                            <div className="wave-bar w-[3px] bg-[#9333EA] rounded-[1px] h-[60%] animate-[wave_0.7s_infinite_alternate]"></div>
                                            <div className="wave-bar w-[3px] bg-[#9333EA] rounded-[1px] h-[45%] animate-[wave_0.6s_infinite_alternate]"></div>
                                            <div className="wave-bar w-[3px] bg-[#9333EA] rounded-[1px] h-[80%] animate-[wave_0.5s_infinite_alternate]"></div>
                                            <div className="wave-bar w-[3px] bg-[#9333EA] rounded-[1px] h-[40%] animate-[wave_0.7s_infinite_alternate]"></div>
                                        </>
                                    )}
                                </div>
                                
                                <div className="song-controls flex gap-4 pr-5">
                                    <button 
                                        className={`control-btn play w-[54px] h-[54px] rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 text-[20px] ${(index === songindex && playPlaylistID === playlistid) ? 'bg-[#7e22ce]' : 'bg-[#9333EA]'} text-white hover:bg-[#7e22ce] hover:scale-[1.05] hover:shadow-[0_0_12px_rgba(147,51,234,0.5)]`} 
                                        onClick={() => handlePlay(songindex)}
                                    >
                                        {(index === songindex && playPlaylistID === playlistid) ? <FaRegCirclePause /> : <FaRegCirclePlay />}
                                    </button>
                                    <button 
                                        className="control-btn delete w-[54px] h-[54px] rounded-full flex items-center justify-center border-none cursor-pointer transition-all duration-200 text-[20px] bg-[rgba(26,26,26,0.7)] text-white backdrop-blur-sm border border-[rgba(255,255,255,0.05)] hover:bg-[rgba(229,62,62,0.15)] hover:text-[#E53E3E] hover:border-[rgba(229,62,62,0.3)]" 
                                        onClick={() => removeFromPlaylist(songindex)}
                                    >
                                        <RiDeleteBin6Line />
                                    </button>
                                </div>
                                
                                <div className="song-progress h-[3px] w-full bg-[#2A2A2A] absolute bottom-0 left-0 right-0">
                                    {(index === songindex && playPlaylistID === playlistid) && (
                                        <div className="absolute h-full bg-[#9333EA] transition-[width] duration-300" style={{ width: '65%' }}></div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-white text-lg">
                            No songs in this playlist! Add some to start the vibe 😎
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}