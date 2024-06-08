import { ToastContainer, toast } from "react-toastify";
import supabase from "./ClientInstance";
import { useState, useEffect } from "react";
import toast_style from "./ToastStyle";
import { BeatLoader } from "react-spinners";
import { Link, useParams } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";

export default function AddSongModel(): JSX.Element {
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [songs, setSongs] = useState<Array<Song>>([])

    const {username, playlistid} = useParams()
    
    useEffect(() => {
        const loadSongs = async () => {   
            try {
                let songIDs=[]
                let filteredSongs=[]
                let playlistsongIDs=[]
                const {data, error} = await supabase.from('song_information').select('*').eq('uploaded_by', username)
                if (error) throw error

                for (let i=0;i<data.length;i++) {
                    songIDs.push(data[i].id)
                }

                const {data: playlistSongs, error: playlistError} = await supabase.from('playlistsong_information').select('song_id').eq('playlist_id', playlistid).in('song_id', songIDs)
                if (playlistError) throw playlistError

                for (let i=0;i<playlistSongs.length;i++) {
                    playlistsongIDs.push(playlistSongs[i].song_id)
                }

                for (let i=0;i<songIDs.length;i++) {
                    if (!playlistsongIDs.includes(songIDs[i])) {
                        filteredSongs.push(songIDs[i])
                    }
                }        

                const {data: songsData, error: songsError} = await supabase.from('song_information').select('*').in('id', filteredSongs)
                if (songsError) throw songsError

                setSongs(songsData)

                setIsLoading(false)

                
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message, toast_style)
                }    
            }    
        }

        loadSongs()
    // eslint-disable-next-line    
    }, [])    

    const handleClick = async (song: Song) => {
        const {error} = await supabase.from('playlistsong_information').insert({playlist_id: playlistid, song_id: song.id})

        if (error) {
            toast.error(error.message, toast_style)
        } else {
            toast.success("Song added successfully!")
            setSongs(prevSongs => prevSongs.filter(s => s.id !== song.id))
        }
    }

    if (isLoading) {
        return (
            <div className='flex w-screen h-screen justify-center bg-gradient-to-b from-black to-blue-600 items-center my-auto'>
                <BeatLoader size={30} color="purple"/>
            </div>
        )
    }

    return (
        <div className="min-w-screen min-h-screen overflow-x-hidden bg-gradient-to-b from-black to-blue-600 shadow-lg p-8">
            <div className="absolute flex flex-col top-0 right-0 m-2 text-red-700 hover:text-red-500 text-lg font-bold focus:outline-none">
                <Link to={`/${username}`}>
                    <IoMdClose size={40}/>
                </Link>    
            </div>
            <div className="text-white text-4xl text-center">Add your uploaded songs to this playlist</div>
            <div className="mt-2 border-white border-t-2 mb-10"></div>
            <div className="flex flex-col flex-wrap h-screen justify-start items-center">
            {songs!==null ? (songs.length!==0 ? ((songs.map((song, index) => (
                <div key={index} className="flex flex-row items-center w-2/3 h-1/6 bg-blue-600 rounded-lg mb-5 text-white">
                    <img src={song.image_path} className="h-2/3 w-1/5 rounded-lg ml-2" alt="song cover art"/>
                    <div className="flex flex-col flex-wrap ml-4">
                        <div className="text-xl">{song.song_name}</div>
                        <div className="text-sm">By: {song.artist_name}</div>
                    </div>
                    <div className="flex flex-row text-green-500 hover:text-white ml-auto mr-4" onClick={()=>handleClick(song)}><FaPlus size={30}/></div>
                </div>
            )))) : (
                <div className="text-white text-lg">No songs to add, try uploading some to add them to this playlist!</div>
            )) : (
                <div className="text-white text-lg w-full h-full flex justify-center items-center">Loading...</div>
            )}
            </div>
            <ToastContainer position="top-right" autoClose={700} hideProgressBar={true} closeOnClick pauseOnHover draggable theme='dark'/>
        </div>
    )
}