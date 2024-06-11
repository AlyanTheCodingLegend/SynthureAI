import { Howl } from 'howler';
import { useEffect, useState } from 'react';
import ReactSlider from 'react-slider';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlay, FaPause, FaForwardStep, FaBackwardStep } from "react-icons/fa6";
import { FaVolumeMute, FaVolumeUp, FaRandom } from "react-icons/fa";
import { MdOutlineLoop } from "react-icons/md";
import { useParams } from 'react-router-dom';
import supabase from './ClientInstance';
import { toast } from 'react-toastify';

type PlayerProps = {
    isOpen: boolean;
    songs: string[];
    setSongs: (value: string[]) => void;
    index: number;
    setIndex: (value: number) => void;
}

export default function Player ({isOpen, songs, setSongs, index, setIndex}: PlayerProps): JSX.Element {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [song, setSong] = useState<Howl | null>(null)
    const [duration, setDuration] = useState<number>(0)
    const [progress, setProgress] = useState<number>(0)
    const [volume, setVolume] = useState<number>(1)
    const [repeat, setRepeat] = useState<boolean>(false)
    const [isMuted, setIsMuted] = useState<boolean>(false)
    const [prevVol, setPrevVol] = useState<number>(0)
    const [mins, setMins] = useState<number>(0)
    const [secs, setSecs] = useState<number>(0)
    const [Tmins, setTMins] = useState<number>(0)
    const [Tsecs, setTSecs] = useState<number>(0)
    const [randomize, setRandomize] = useState<boolean>(false)
    const [disabled, setDisabled] = useState<boolean>(false)
    const [socket, setSocket] = useState<WebSocket | null>(null)
    const [userID, setuserID] = useState<string>("")
    const [sessionID, setSessionID] = useState<number>(444)
    const [isAdmin, setIsAdmin] = useState<boolean>(false)

    const userData = useParams()
    const username = userData.username as string

    useEffect(() => {
        if (isPlaying) {
            setMins(Math.trunc(progress/60))
            setSecs(Math.trunc(progress-(mins*60)))
            setTMins(Math.trunc(duration/60))
            setTSecs(Math.trunc(duration-(Tmins*60)))
        }
    // eslint-disable-next-line    
    }, [progress, isPlaying, duration])    
 
    useEffect(() => {
        if (songs.length>0) {
            var newSong = new Howl({
                src: [songs[index]],
                format: ["mp3"],
                volume: volume,
                loop: repeat,
                onplay: () => {
                    setIsPlaying(true);
                    if (socket?.readyState===WebSocket.OPEN && isAdmin) {
                        socket?.send(JSON.stringify({ type: "seek", sessionID: sessionID, time: progress }))
                    }    
                },
                onpause: () => {
                    setIsPlaying(false);
                    if (socket?.readyState===WebSocket.OPEN && isAdmin) {
                        socket?.send(JSON.stringify({ type: "pause", sessionID: sessionID}))
                    }
                },
                onload: () => {
                    setDuration(newSong.duration());
                    setDisabled(false);
                    if (socket?.readyState===WebSocket.OPEN && isAdmin) {
                        socket?.send(JSON.stringify({ type: "play", sessionID: sessionID }))
                    } 
                },
                onend: () => {
                    setIsPlaying(false);
                    setProgress(0);
                    if (randomize) {
                        randomizeSong(0,songs.length-1)
                    } else {
                        if (index<songs.length-1) {
                            setIndex(index+1)
                        }
                        else {
                            setIndex(0)
                        }
                    } 
                }
            })
            setSong(newSong)
            
            return () => {
                newSong.unload()
            }
        }
    // eslint-disable-next-line
    }, [songs, index])

    const handleClick = () => {
        if (isPlaying) {
            if (song) {
                song.pause()
            }   
        }
        else {
            if (song) {
                song.play()
            }   
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (song && isPlaying) {
                setProgress(song.seek() || 0);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [song, isPlaying]);
 
    const handleSeek = (position: number) => {
        if (position<=duration) {
            if (song) {
                song.seek(position)
            }    
            setProgress(position)
            if (socket?.readyState===WebSocket.OPEN && isAdmin) {
                socket?.send(JSON.stringify({ type: "seek", sessionID: sessionID, time: position }))
            }
        }
    }

    const handleVolumeSeek = (vol: number) => {
        if (song) {
            song.volume(vol)
        }    
        setVolume(vol)
    }

    const handleVolumeMute = () => {
        if (!isMuted) {
            setPrevVol(volume)
            if (song) {
                song.volume(0)
            }    
            setVolume(0)
        } else {
            if (song) {
                song.volume(prevVol)
            }    
            setVolume(prevVol)
        }
        setIsMuted(!isMuted)
    }

    useEffect(() => {
        if (song) {
            song.play()
        }      
    // eslint-disable-next-line   
    }, [duration])

    useEffect(() => {
        if (socket) {
            socket.onopen = () => {
                console.log(`Connected to server ${(isAdmin) ? "as admin" : ""}`)
                socket.send(JSON.stringify({ type: "join", sessionID: sessionID, userID: userID, isAdmin: isAdmin }))
            }
            
            socket.onmessage = (event) => {
                handleMessage(event.data)
            }

            socket.onclose = () => {
                console.log("Disconnected from server")
            }

            socket.onerror = (error) => {
                console.error("Error: ", error)
            }
        }    
    }, [socket])    

    const handleMessage = (data: string) => {
        const message = JSON.parse(data);

        // Implement your message handling logic here
        switch (message.type) {
            case 'sync':
                if (message.songs) {
                    setSongs(message.songs)
                }
                if (message.index) {
                    setIndex(message.index)
                }
                break;
            case 'play':
                if (song) {
                    song.play();
                }
                break;
            case 'pause':
                if (song) {
                    song.pause();
                }
                break;
            case 'seek':
                handleSeek(message.time);
                break;
            default:
                console.log("Unknown message type: ", message.type);
        }
    }

    const handlePlayNextSong = () => {
        setDisabled(true)
        if (song) {
            song.pause()
            song.unload()
        }
        if (index<songs.length-1) {
            setIndex(index+1)
        } else{
            setIndex(0)
        }
    }

    const handlePlayPrevSong = () => {
        setDisabled(true)
        if (song) {
            song.pause()
            song.unload()
        }
        if (index>=1) {
            setIndex(index-1)
        } else {
            setIndex(songs.length-1)
        }
    }

    const randomizeSong = (min: number, max: number) => {
        min = Math.ceil(min)
        max = Math.ceil(max)
        setIndex(Math.floor(Math.random()*(max-min+1)) + min)
    }

    const handleCollab = async () => {
        setIsAdmin(true)
        const socket = new WebSocket("ws://localhost:5000")
        setSocket(socket)

        const {data, error} = await supabase.from('user_information').select('userid').eq('username', username)
        if (error) {
            toast.error("Error fetching user information")
            return
        } else {
            setuserID(data[0].userid)
        }
    }

    const handleCollabTwo = async () => {
        const {data, error} = await supabase.from('user_information').select('userid').eq('username', username)
        if (error) {
            toast.error("Error fetching user information")
            return
        } else {
            setuserID(data[0].userid)
            const socket = new WebSocket("ws://localhost:5000")
            setSocket(socket)
        }
    }

    useEffect(() => {
        if (isMuted && volume!==0) {
            setIsMuted(false)
        }
        if (volume===0) {
            setIsMuted(true)
        }
    // eslint-disable-next-line    
    }, [volume])

    return (
        <>
        {song && (
            <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} fixed bg-gray-800 bottom-0 w-full justify-between items-center p-4`}>
                <div className='flex flex-col justify-center items-center'>
                    <div className="flex flex-row w-full">
                        <div id="timer" className='font-mono -mt-1.5 text-base text-white'>
                            {mins}:{secs < 10 ? "0" + secs : secs}
                        </div>
                        <ReactSlider
                            className="flex-grow h-2 bg-gray-700 rounded-md mx-1 cursor-pointer"
                            onAfterChange={handleSeek}
                            value={progress}
                            min={0}
                            max={duration}
                            disabled={disabled || (socket!==null && !isAdmin)}
                            thumbClassName="w-4 h-4 bg-purple-400 hover:bg-purple-900 rounded-full -mt-1 outline-none focus:outline-none -top-1/6 cursor-pointer"
                            trackClassName="h-full rounded-full bg-gradient-to-r from-gray-300 to-purple-600"
                        />
                        <div className='font-mono -mt-1.5 text-base text-center text-white mr-1'>
                            {Tmins}:{Tsecs < 10 ? "0" + Tsecs : Tsecs}
                        </div>
                    </div>

                    <div className='flex flex-row items-center w-full justify-end'>
                    <div className='flex mr-auto ml-4 items-center justify-center'>   
                        <div className={randomize ? 'text-green-400 hover:cursor-pointer' : 'text-white hover:cursor-pointer'} onClick={() => setRandomize(!randomize)}>
                            <FaRandom size={22} />
                        </div>
                        <div className={repeat ? 'text-green-400 hover:cursor-pointer ml-2' : 'text-white hover:cursor-pointer ml-2'} onClick={() => setRepeat(!repeat)}>
                            <MdOutlineLoop size={24} />
                        </div>
                        <button disabled={socket?.readyState!==socket?.CLOSED} className='bg-red-800 hover:bg-red-600 text-white' onClick={handleCollab}>
                            Hey
                        </button>
                        <button disabled={socket?.readyState!==socket?.OPEN} className='bg-blue-800 hover:bg-blue-600 text-white' onClick={()=>{
                            if (socket?.readyState===socket?.OPEN) {
                                socket?.send(JSON.stringify({ type: "leave", sessionID: sessionID, userID: userID }))
                            }
                            socket?.close()
                        }}>
                            Le
                        </button>
                        <button disabled={socket?.readyState!==socket?.CLOSED} className='bg-red-800 hover:bg-red-600 text-white' onClick={handleCollabTwo}>
                            nA
                        </button>
                    </div>     
                    <div className='flex items-center mr-10 w-2/5 justify-center'>
                    
                        <button disabled={disabled || (socket!==null && !isAdmin)} className="text-white mr-4 hover:text-green-500" onClick={handlePlayPrevSong}><FaBackwardStep size={20}/></button>
                            <button
                                disabled={disabled || (socket!==null && !isAdmin)}
                                onClick={handleClick}
                                className={disabled ? "text-white mr-2 rounded-full h-8 w-8 bg-slate-600 text-xs text-center cursor-not-allowed flex items-center justify-center" : "text-white mr-2 rounded-full h-8 w-8 bg-purple-900 text-xs text-center flex items-center justify-center"}
                            >
                                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                            </button>
                            <button disabled={disabled || (socket!==null && !isAdmin)} className="text-white ml-2 hover:text-green-500" onClick={handlePlayNextSong}><FaForwardStep size={20}/></button>
                            <button className='text-white bg-purple-800 hover:bg-purple-600' onClick={()=>{
                                if (socket?.readyState===socket?.OPEN && isAdmin) {
                                    socket?.send(JSON.stringify({ type: "sync", sessionID: sessionID, songs: songs, index: index }))
                                }
                            }}>
                                Sync
                            </button>
                        </div>
                        <div className="flex items-center w-1/5 justify-end">
                            <button className="flex justify-center items-center text-white mr-1 rounded-full bg-blue-900 hover:bg-blue-800 w-10 h-6 text-xs text-center" onClick={handleVolumeMute}>
                                {isMuted ? <FaVolumeMute size={15} /> : <FaVolumeUp size={15} />}
                            </button>
                            <ReactSlider
                                className="h-2 rounded-md w-full"
                                value={volume}
                                onChange={handleVolumeSeek}
                                min={0}
                                max={1}
                                step={0.01}
                                thumbClassName="w-4 h-4 bg-green-400 rounded-full -mt-1 outline-none focus:outline-none hover:bg-blue-400 cursor-pointer"
                                trackClassName="h-full hover:cursor-pointer rounded-full bg-gradient-to-l from-blue-400 to-green-400"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
    )
}
