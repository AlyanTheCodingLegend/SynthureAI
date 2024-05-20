import React, { useEffect, useState } from "react";
import supabase from "./ClientInstance";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";
import { IoMdArrowBack } from "react-icons/io";
import { FaRegCirclePlay } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useNavigate } from "react-router-dom";

export default function ShowPlaylistModel({isOpen, playlistid, setOpenPlaylist, setSongArray, setSongNameArray, setImageArray, setIndexArray, setIndex, username}) {
    const [name, setName] = useState(null)
    const [songnames, setSongnames] = useState([])
    const [images, setImages] = useState([])
    const [artists, setArtists] = useState([])
    const [indexes, setIndexes] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const navigate = useNavigate()

    useEffect(() => {
        async function loadSongsFromPlaylist(playlistID) {
            let songArray=[]
            let songNameArray=[]
            let imageArray=[]
            let indexArray=[]
            let artistArray=[]
            let songDataArray=[]
            const {data: playlistData, error: playlistError} = await supabase.from('playlist_information').select('playlist_name').eq('playlist_id', playlistID)
            if (playlistError) {
                toast.error(playlistError.message, toast_style)
                return
            } else {
                setName(playlistData[0].playlist_name)
            }    
            const {data, error} = await supabase.from('playlistsong_information').select('song_id').eq('playlist_id', playlistID)
            if (error) {
                toast.error(error.message, toast_style)
                return
            } else {
                if (data.length!==0) {

                    for (let i=0;i<data.length;i++) {
                        songDataArray.push(data[i].song_id)
                    
                    }
                    const {data: songData, error: songError} = await supabase.from('song_information').select('*').in('id', songDataArray)
                    if (songError) {
                        toast.error(songError.message, toast_style)
                        return
                    } else {
                        for (let j=0;j<songData.length;j++) {
                            songArray.push(songData[j].song_path)
                            songNameArray.push(songData[j].song_name)
                            imageArray.push(songData[j].image_path)
                            indexArray.push(songData[j].id)
                            artistArray.push(songData[j].artist_name)
                        }
                    }    
                
                    setSongArray(songArray)
                    setSongNameArray(songNameArray)
                    setImageArray(imageArray)
                    setIndexArray(indexArray)
                    setIndexes(indexArray)
                    setSongnames(songNameArray)
                    setImages(imageArray)
                    setArtists(artistArray)
                }
            }
        }

        loadSongsFromPlaylist(playlistid)
    }, [])
    
    const removeFromPlaylist = async (songid) => {
        setIsLoading(true)
        const {error} = await supabase.from("playlistsong_information").delete().eq('playlist_id', playlistid).eq('song_id', songid)
        if (error) {
            toast.error(error.message, toast_style)
        } else {
            toast.success('Song removed from playlist!', toast_style)
        }
        setIsLoading(false)
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

    return (
        <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} bg-gradient-to-b from-black to-slate-700 w-screen min-h-screen overflow-x-hidden`}>
            <div className="flex flex-row justify-end mt-4">
                <div className="flex flex-row w-2/3">
                        <div className="ml-4 text-4xl mb-1.5 text-white">{name}</div>
                </div> 
                <div className="w-1/3 flex flex-row justify-end items-center text-gray-400">
                    <div className="mr-2 mt-2 flex justify-end hover:text-white hover:cursor-pointer" onClick={()=>setOpenPlaylist(false)}><IoMdArrowBack size={40}/></div>
                    <div className="mt-2 mr-2 hover:text-white hover:cursor-pointer" onClick={() => navigate(`/${username}/${playlistid}/addsongs`)}><FaPlus size={25}/></div>
                    <div className="mt-2 mr-2 hover:text-white hover:cursor-pointer" onClick={() => deletePlaylist()}><MdDeleteForever size={30}/></div>
                </div>
            </div>  
            <div className="text-white text-2xl h-full -mt-1.5">
                <div className="mt-0.5 border-gray-400 border-t-2 mb-16"></div>
            {songnames && songnames.length!==0 ? songnames.map((songname, songindex)=> (
                <div className="ml-4 rounded-lg w-5/6 h-1/6 flex flex-row items-center text-gray-400 hover:text-white hover:cursor-pointer">
                    <div className="flex flex-row justify-start items-center h-4/5 w-4/5">
                    <img src={images[songindex]} className="h-full w-1/4 rounded-lg ml-2"/>
                        <div className="flex flex-col flex-wrap ml-4">
                            <div className="text-xl">{songname}</div>
                            <div className="text-sm">By: {artists[songindex]}</div>
                        </div>
                    </div>
                    <div className="flex flex-row justify-end text-green-500 hover:text-white mr-4" onClick={()=>setIndex(songindex)}><FaRegCirclePlay size={30}/></div>
                    <div className="flex flex-row justify-end text-green-500 hover:text-white" onClick={()=>removeFromPlaylist(indexes[songindex])}><RiDeleteBin6Line size={30}/></div>
                </div>)) : (
                    <div className="ml-4 text-lg">No songs in this playlist! Add some to start the vibe 😎</div>
                )
            }
            </div>    
        </div>
    )
}