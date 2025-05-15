"use client";

import React, { useEffect, useState, type JSX } from "react";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";
import "../_styles/NoScrollbar.css"
import "../_styles/InputCustom.css"
import { BeatLoader } from "react-spinners";
import { FaRegCirclePause, FaRegCirclePlay } from "react-icons/fa6";
import useSongs from "../_hooks/useSongs";
import usePlaylists from "../_hooks/usePlaylists";
import useSongsFromPlaylist from "../_hooks/useSongsFromPlaylist"; 
import type { Playlist, Song } from "../_types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../_states/store";
import { setOpenPlaylist, setPlaylistID, setSongArray } from "../_states/songArraySlice";
import { useParams } from "next/navigation";
import { SearchIcon } from "lucide-react";

export default function Layout(): JSX.Element {
    const [playlists, setPlaylists] = useState<Array<Playlist>>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [songs, setSongs] = useState<Array<Song>>([])
    const [songName, setSongName] = useState<string>("")
    const [filteredSongs, setFilteredSongs] = useState<Array<Song>>([])
    const [songPlaying, setSongPlaying] = useState<number>(-1)
    const [showUploadModal, setShowUploadModal] = useState<boolean>(false)

    const isOpen = useSelector((state: RootState) => state.songs.isOpen)

    const params = useParams<{username: string}>()
    const username = params.username

    const dispatch = useDispatch<AppDispatch>()

    const {data: playlistData, error: playlistError} = usePlaylists(username)
    const {data: songData, error: songError} = useSongs(username)
    
    // Get My Songs playlist data using the environment variable
    const mySongsPlaylistID = Number(process.env.NEXT_PUBLIC_MYSONGS_ID)
    const {data: mySongsData, error: mySongsError} = useSongsFromPlaylist(mySongsPlaylistID, username)

    useEffect(() => {
        if (playlistError) {
            toast.error(playlistError, toast_style)
        } else if (playlistData) {
            setPlaylists(playlistData)
            setIsLoading(false)
        }

        if (songError) {
            toast.error(songError.message, toast_style)
        } else if (songData) {
            setSongs(songData)
        }
        
        if (mySongsError) {
            toast.error(mySongsError, toast_style)
        }
    }, [playlistData, playlistError, songData, songError, mySongsError])

    const handleSearch = async () => {
        if (songName === "") {
            setFilteredSongs([])
            return
        }

        const filtered = songs.filter(song => song.song_name.toLowerCase().includes(songName.toLowerCase()))

        if (filtered.length > 0) {
            setFilteredSongs(filtered)
        } else {
            toast.info("No songs found, fetching from YouTube...", toast_style)
            await handleFetchSong()
        }
    }

    const handleFetchSong = async () => {
        try {
            const response = await fetch(`/api/fetchSong?string=${songName}&username=${username}`);
            const data = await response.json()
            if (data.error) {
                toast.error(data.error, toast_style)
                return
            }
            setFilteredSongs(data.song)
            toast.success("Song fetched successfully!", toast_style) 
        } catch (error) {
            toast.error("Error fetching song", toast_style)
        }
    }

    const handlePlay = (song: Song) => {
        setSongPlaying(song.id)
        dispatch(setSongArray([song.song_path]))
    }
    
    // Handle playing a song from My Songs section
    const handlePlayMySong = (index: number) => {
        if (mySongsData && mySongsData.indexes[index] !== undefined) {
            setSongPlaying(mySongsData.indexes[index])
            dispatch(setSongArray([mySongsData.backupsongs[index]]))
        }
    }

    if (isLoading) {
        return (
            <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-black w-screen min-h-screen overflow-x-hidden flex items-center justify-center`}>
                <BeatLoader size={30} color="purple"/>
            </div>
        )
    }

    return (
        <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-black w-screen min-h-screen overflow-x-hidden no-scrollbar`}>
            <div className="text-white px-8 py-6 h-full">
                {/* Top search section */}
                <div className="flex justify-between items-center mb-4">
                    <div className="relative w-80">
                        <div className="absolute hover:cursor-pointer inset-y-0 left-0 flex items-center pl-3">
                            <SearchIcon onClick={handleSearch} className="hover:cursor-pointer" />
                        </div>
                        <input 
                            id="songname"
                            value={songName}
                            onChange={(e)=> setSongName(e.target.value)}
                            type="text" 
                            placeholder="Search for any song! We will fetch it!"
                            className="pl-10 pr-4 py-2 w-full rounded-full bg-zinc-800 border-none text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        
                        {filteredSongs.length > 0 && (
                            <div className="absolute left-0 right-0 mt-2 bg-zinc-900 rounded-lg p-2 shadow-lg z-10">
                                <h2 className="text-lg font-semibold px-4 py-2">Search Results</h2>
                                <ul>
                                    {filteredSongs.map((song, index) => (
                                        <li key={index} className="py-2 px-4 hover:bg-zinc-800 rounded-md">
                                            <div className="flex items-center">
                                                <img src={song.image_path || "/api/placeholder/48/48"} alt={song.song_name} className="w-10 h-10 rounded-md mr-3 z-0" />
                                                <div className={`${(songPlaying===song.id) ? "text-white" : "text-gray-300"} flex-1`}>  
                                                    <h3 className="font-medium">{song.song_name}</h3>
                                                    <p className="text-sm text-gray-400">{song.artist_name}</p>
                                                </div>
                                                <div 
                                                    className={`${(songPlaying===song.id) ? "text-white" : "text-green-500 hover:text-green-400"} cursor-pointer`} 
                                                    onClick={() => handlePlay(song)}
                                                >
                                                    {(songPlaying===song.id) ? <FaRegCirclePause size={20}/> : <FaRegCirclePlay size={20}/>}
                                                </div>    
                                            </div>    
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                   
                </div>

                {/* Welcome message */}
                <h1 className="text-4xl font-bold mb-12">Welcome Back, {username}</h1>
                
                {/* Recent Playlists section */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">Your Recent Playlists</h2>
                        <a href="#" className="text-purple-500 hover:text-purple-400 text-sm">View All</a>
                    </div>
                    
                    {playlists && playlists.length !== 0 ? (
                        <div className="grid grid-cols-4 gap-6">
                            {playlists.map((playlist, index) => (
                                <div 
                                    key={index} 
                                    className="bg-zinc-900 p-4 rounded-lg cursor-pointer hover:bg-zinc-800 transition-all"
                                    onClick={() => { 
                                        dispatch(setPlaylistID(Number(playlist.playlist_id))); 
                                        dispatch(setOpenPlaylist(true)); 
                                    }}
                                >
                                    <div className="mb-4 bg-zinc-800 rounded-md aspect-square flex items-center justify-center">
                                        <img 
                                            src={playlist.cover_url} 
                                            alt={playlist.playlist_name} 
                                            className="w-full h-full rounded-md z-0" 
                                        />
                                    </div>
                                    <h3 className="font-semibold">{playlist.playlist_name}</h3>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-900 p-6 rounded-lg text-center">
                            <p className="text-gray-400">You don't have any playlists yet. Create one to get started!</p>
                        </div>
                    )}
                </div>
                
                {/* My Songs section - ADDED */}
                <div className="mb-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold">My Songs</h2>
                        <a 
                            href="#" 
                            className="text-purple-500 hover:text-purple-400 text-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                dispatch(setPlaylistID(mySongsPlaylistID)); 
                                dispatch(setOpenPlaylist(true));
                            }}
                        >
                            View All
                        </a>
                    </div>
                    
                    {mySongsData && mySongsData.songnames.length > 0 ? (
                        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
                            {mySongsData.songnames.map((songName, index) => (
                                <div 
                                    key={index} 
                                    className="min-w-[280px] bg-zinc-900 rounded-lg overflow-hidden hover:bg-zinc-800 transition-all hover:translate-y-[-5px] hover:shadow-lg cursor-pointer group"
                                    onClick={() => handlePlayMySong(index)}
                                >
                                    <div className="relative">
                                        <img 
                                            src={mySongsData.images[index] || "/api/placeholder/280/280"} 
                                            alt={songName} 
                                            className="w-full h-[180px] object-cover -z-10" 
                                        />
                                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                                            {songPlaying === mySongsData.indexes[index] ? 
                                                <FaRegCirclePause size={50} className="text-purple-500" /> : 
                                                <FaRegCirclePlay size={50} className="text-purple-500" />
                                            }
                                        </div>
                                    </div>
                                    <div className="p-4 flex justify-between items-start">
                                        <div>
                                            <h3 className="font-medium text-gray-200 group-hover:text-white">{songName}</h3>
                                            <p className="text-sm text-gray-400">{mySongsData.artists[index]}</p>
                                        </div>
                                        <div className={`${songPlaying === mySongsData.indexes[index] ? "text-purple-500" : "text-gray-400"}`}>
                                            {/* You could add song duration here if available */}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-zinc-900 p-6 rounded-lg text-center">
                            <p className="text-gray-400">You don't have any songs yet. Upload some to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Song Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={() => setShowUploadModal(false)}></div>
                    <div className="bg-blue-600 p-6 rounded-lg w-full max-w-md relative z-10">
                        <button 
                            className="absolute top-2 right-2 text-white text-xl font-bold"
                            onClick={() => setShowUploadModal(false)}
                        >
                            X
                        </button>
                        
                        <h2 className="text-white text-xl mb-4">Upload Song</h2>
                        
                        <form className="space-y-4">
                            <input
                                type="text"
                                placeholder="Enter song name"
                                className="w-full p-3 bg-gray-800 text-white rounded-md"
                            />
                            
                            <input
                                type="text"
                                placeholder="Enter artist name"
                                className="w-full p-3 bg-gray-800 text-white rounded-md"
                            />
                            
                            <div className="w-full p-3 bg-gray-800 text-white rounded-md flex">
                                <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 px-4 py-1 rounded mr-2">
                                    Choose File
                                    <input type="file" className="hidden" />
                                </label>
                                <span className="flex-1 py-1">No file chosen</span>
                            </div>
                            
                            <button
                                type="submit"
                                className="w-full p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                            >
                                Upload Song
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}