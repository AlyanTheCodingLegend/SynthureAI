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
import type { Playlist, Song } from "../_types/types";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../_states/store";
import { setOpenPlaylist, setPlaylistID, setSongArray } from "../_states/songArraySlice";
import { useParams } from "next/navigation";

export default function Layout(): JSX.Element {
    const [playlists, setPlaylists] = useState<Array<Playlist>>([])
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [songs, setSongs] = useState<Array<Song>>([])
    const [songName, setSongName] = useState<string>("")
    const [filteredSongs, setFilteredSongs] = useState<Array<Song>>([])
    const [songPlaying, setSongPlaying] = useState<number>(-1)

    const isOpen = useSelector((state: RootState) => state.songs.isOpen)

    const params = useParams<{username: string}>()
    const username = params.username

    const dispatch = useDispatch<AppDispatch>()

    const {data: playlistData, error: playlistError} = usePlaylists(username)
    const {data: songData, error: songError} = useSongs(username)

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
    }, [playlistData, playlistError, songData, songError])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSongName(e.target.value)

        if (e.target.value === "") {
            setFilteredSongs([])
        } else {
            const filtered = songs.filter(song => song.song_name.toLowerCase().includes(e.target.value.toLowerCase()))
            setFilteredSongs(filtered)
        }
    }

    const handlePlay = (song: Song) => {
        setSongPlaying(song.id)
        dispatch(setSongArray([song.song_path]))
    }

    if (isLoading) {
        return (
            <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-gradient-to-b from-black to-slate-700 w-screen min-h-screen overflow-x-hidden flex items-center justify-center`}>
                <BeatLoader size={30} color="purple"/>
            </div>
        )
    }

    return (
        <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-gradient-to-b from-black to-slate-700 w-screen min-h-screen overflow-x-hidden no-scrollbar`}>
            <div className="text-white text-2xl h-full">
                <div className="ml-4 mt-2 text-4xl">Welcome, {username} 👋</div>
                <div className="mt-5 border-gray-300 border-t-2 mb-5"></div>
                <div className="ml-4 text-xl mb-2">Search for your favourite songs down below! 👇</div>
                <div className="ml-4">
                    <input value={songName} id="songname" onChange={handleSearch} type="text" placeholder="Enter the song name here" className="border-2 rounded-lg border-opacity-100 border-white bg-black mb-4 text-lg w-3/4 hover:border-collapse input-custom flex flex-row items-center"/>
                    <ul>
                        {filteredSongs.map((song, index) => (
                            <li key={index}>
                                <div className="flex flex-row items-center mb-4">
                                    <img src={song.image_path} alt="song" className="w-10 h-10 rounded-lg" />
                                    <div className={`${(songPlaying===song.id) ? "text-white" : "text-gray-400"} flex flex-col ml-2`}>  
                                        <h1 className="text-xl">{song.song_name}</h1>
                                        <h1 className="text-sm">By: {song.artist_name}</h1>
                                    </div>
                                    <div className={`${(songPlaying===song.id) ? "text-white" : "text-green-500 hover:text-green-300"} ml-auto mr-6 cursor-pointer`} onClick={() => handlePlay(song)}>
                                        {(songPlaying===song.id) ? <FaRegCirclePause size={30}/>: <FaRegCirclePlay size={30}/>}
                                    </div>    
                                </div>    
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="mt-5 border-gray-300 border-t-2 mb-5"></div>
                <div className="mb-5 ml-4">Your Playlists</div>
                {playlists && playlists.length!==0 ? (
                <div className="flex flex-wrap">
                    {playlists && playlists.map((playlist, index) => (
                    <div key={index} className="relative group ml-4 mb-10">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-700 to-purple-400 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex flex-col justify-center items-center h-40 w-40 bg-black rounded-lg text-gray-200 hover:text-white hover:cursor-pointer" onClick={() => { dispatch(setPlaylistID(Number(playlist.playlist_id))); dispatch(setOpenPlaylist(true)); }}>
                            <img src="" alt="default playlist" className="w-4/5 h-4/5 rounded-lg" />
                            <div className="text-lg px-2 text-center overflow-hidden text-overflow-ellipsis whitespace-nowrap" style={{ maxWidth: '90%' }}>{playlist.playlist_name}</div>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                    <div className="text-sm ml-4">
                        Please create playlists to listen to them and view them here 😊
                    </div>
                )}
            </div>
        </div>
    )
}