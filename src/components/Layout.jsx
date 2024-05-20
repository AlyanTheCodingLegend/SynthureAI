import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";
import supabase from "./ClientInstance";

export default function Layout({isOpen, username, setOpenPlaylist, setPlaylistID}) {
    const [playlists, setPlaylists] = useState(null)

    async function loadSongs (username) {
        let songArray=[]
        let songNameArray=[]
        let imageArray=[]
        let indexArray=[]
        const { count } = await supabase.from("song_information").select("*",{count: "exact", head: true}).eq('uploaded_by', username)
        const { data } = await supabase.from("song_information").select("*").eq('uploaded_by', username)
        
        for (let i=0;i<count;i++) {
            songArray.push(data[i].song_path.split(",")[0])
            songNameArray.push(data[i].song_name.split(",")[0])
            imageArray.push(data[i].image_path)
            indexArray.push(data[i].id)
        }
        
        return [songArray, songNameArray, imageArray, indexArray]
    }

    useEffect(() => {
        async function loadPlaylists() {
            const {data, error} = await supabase.from('playlist_information').select('playlist_id, playlist_name').eq('created_by', username)
            if (error) {
                toast.error(error.message, toast_style)
            } else {
                setPlaylists(data)
            }
        }

        loadPlaylists()
    }, [])

    async function loadSongsFromPlaylist(playlistID) {
        let songArray=[]
        let songNameArray=[]
        let imageArray=[]
        let indexArray=[]
        const {data, error} = await supabase.from('playlistsong_information').select('song_id').eq('playlist_id', playlistID)
        if (error) {
            toast.error(error.message, toast_style)
        } else {
            if (data.length!==0) {
                for (let i=0;i<data.length;i++) {
                    const {data: songData, error: songError} = await supabase.from('song_information').select('*').eq('id', data[i].song_id)
                    songArray.push(songData[i].song_path)
                    songNameArray.push(songData[i].song_name)
                    imageArray.push(songData[i].image_path)
                    indexArray.push(songData[i].id)
                }

                return [songArray, songNameArray, imageArray, indexArray]
            }
        }
    }

    return (
        <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-gradient-to-b from-black to-slate-700 w-screen min-h-screen overflow-x-hidden`}>
            <div className="text-white text-2xl h-full">
                <div className="ml-4 mt-2">Welcome, {username} 👋</div>
                <div className="mt-5 border-gray-300 border-t-2 mb-5"></div>
                <div className="mb-5 ml-4">Your Playlists</div>
                {playlists && playlists.length!==0 ? (
                <div className="flex flex-wrap">
                    {playlists && playlists.map((playlist, index) => (
                    <div key={index} className="hover:cursor-pointer flex flex-col justify-center items-center h-40 w-40 rounded-lg mb-10 ml-4 text-gray-200 hover:text-white" onClick={()=>{setPlaylistID(playlist.playlist_id); setOpenPlaylist(true)}}>
                        <img src="https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/assets/anonymous-man-graphic-good-pfp-1y0csvb81cmqaggg.jpg" className="w-4/5 h-4/5 rounded-lg"/>
                        <div className="text-lg">{playlist.playlist_name}</div>
                    </div>
                    ))}
                </div>
                   
                ) : (<div className="text-sm ml-4">Please create playlists to listen to them and view them here 😊</div>)}
            </div>
        </div>
    )
}