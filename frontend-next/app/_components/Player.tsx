"use client";

import { Howl } from 'howler';
import { useEffect, useState, type JSX } from 'react';
import ReactSlider from 'react-slider';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlay, FaPause, FaForwardStep, FaBackwardStep } from "react-icons/fa6";
import { FaVolumeMute, FaVolumeUp, FaRandom, FaSlidersH } from "react-icons/fa";
import { MdOutlineLoop } from "react-icons/md";
import { toast } from 'react-toastify';
import toast_style from './ToastStyle';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../_states/store';
import { setDuration, setIndex, setIsAdmin, setProgress, setSessionID, setSocket, setSongArray as setSongs } from '../_states/songArraySlice';
import "../_styles/Player.css";

export default function Player (): JSX.Element {
    const [isPlaying, setIsPlaying] = useState<boolean>(false)
    const [volume, setVolume] = useState<number>(1)
    const [song, setSong] = useState<Howl | null>(null)
    const [repeat, setRepeat] = useState<boolean>(false)
    const [isMuted, setIsMuted] = useState<boolean>(false)
    const [prevVol, setPrevVol] = useState<number>(0)
    const [mins, setMins] = useState<number>(0)
    const [secs, setSecs] = useState<number>(0)
    const [Tmins, setTMins] = useState<number>(0)
    const [Tsecs, setTSecs] = useState<number>(0)
    const [randomize, setRandomize] = useState<boolean>(false)
    const [disabled, setDisabled] = useState<boolean>(false)
    const [showEqualizer, setShowEqualizer] = useState<boolean>(false)
    const [soundProfile, setSoundProfile] = useState<string>("normal")
    
    const songs = useSelector((state: RootState) => state.songs.songs)
    const isOpen = useSelector((state: RootState) => state.songs.isOpen)
    const index = useSelector((state: RootState) => state.songs.index)
    const sessionID = useSelector((state: RootState) => state.songs.sessionID)
    const userID = useSelector((state: RootState) => state.songs.userID)
    const isAdmin = useSelector((state: RootState) => state.songs.isAdmin)
    const socket = useSelector((state: RootState) => state.songs.socket)
    const progress = useSelector((state: RootState) => state.songs.progress)
    const duration = useSelector((state: RootState) => state.songs.duration)

    const dispatch = useDispatch<AppDispatch>()

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
            const newSong = new Howl({
                src: [songs[index]],
                format: ["mp3"],
                volume: volume,
                loop: repeat,
                onplay: () => {
                    setIsPlaying(true);
                    if (socket!==null && isAdmin) {
                        socket?.send(JSON.stringify({ type: "play", sessionID: sessionID }))
                    }    
                },
                onpause: () => {
                    setIsPlaying(false);
                    if (socket!==null && isAdmin) {
                        socket?.send(JSON.stringify({ type: "pause", sessionID: sessionID }))
                    }
                },
                onload: () => {
                    dispatch(setDuration(newSong.duration()));
                    setDisabled(false);
                    if (socket!==null && isAdmin) {
                        socket?.send(JSON.stringify({ type: "nextsong", sessionID: sessionID, index: index }))
                    } 
                },
                onend: () => {
                    setIsPlaying(false);
                    dispatch(setProgress(0));
                    if (randomize) {
                        randomizeSong(0,songs.length-1)
                    } else {
                        if (index<songs.length-1) {
                            dispatch(setIndex(index+1))
                        }
                        else {
                            dispatch(setIndex(0))
                        }
                    } 
                }
            })
            setSong(newSong)
            
            return () => {
                try {
                    if (newSong.playing()) {
                        newSong.stop(); // Ensure the song is stopped before unloading
                    }
                    newSong.unload(); // Unload the song to free up resources
                } catch (error: unknown) {
                    if (error instanceof Error) {
                        toast.error(error.message, toast_style);
                    }    
                }
            }
        }
    // eslint-disable-next-line
    }, [songs, index])

    const handleClick = () => {
        if (isPlaying) {
            song?.pause()  
        }
        else {
            song?.play()  
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if (song && isPlaying) {
                dispatch(setProgress(song.seek() || 0));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [song, isPlaying]);
 
    const handleSeek = (position: number) => {
       
        if (position<=duration) {
            if (song) {
                song.seek(position)
            }    
            dispatch(setProgress(position))
            if (socket!==null && isAdmin) {
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

    const handleSoundProfileChange = (profile: string) => {
        setSoundProfile(profile);
        toast.info(`Sound profile changed to ${profile}`, toast_style);
        // In a real implementation, this would apply audio effects
        // For now, we're just changing the state
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
                socket.send(JSON.stringify({ type: "join", sessionID: sessionID, userID: userID, isAdmin: isAdmin }))
            }
            
            socket.onmessage = (event) => {
                handleMessage(event.data)
            }

            socket.onclose = () => {
                dispatch(setSessionID(-1))
                dispatch(setIsAdmin(false))
                dispatch(setSocket(null))
            }

            socket.onerror = (error) => {
                toast.error("Oops, an error occured!")
            }
        }    
    }, [socket])    

    const handleMessage = (data: string) => {
        const message = JSON.parse(data);

        // Implement your message handling logic here
        switch (message.type) {
            case 'sync':
                if (message.songs) {
                    dispatch(setSongs(message.songs))
                }
                if (message.index) {
                    dispatch(setIndex(message.index))
                }
                if (message.duration) {
                    dispatch(setDuration(message.duration))
                }
                if (message.progress) {
                    dispatch(setProgress(message.progress))
                }
                break;
            case 'nextsong':
                if (message.index) {
                    dispatch(setIndex(message.index))
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
            case 'joinsuccess':
                toast.success(message.message)
                break;
            case 'joinerror':
                socket?.close()
                toast.error(message.message)
                break;
            case 'leavesuccess':
                toast.success(message.message)
                socket?.close()
                break;
            case 'leaveerror':
                toast.error(message.message)
                break;            
            default:
                console.log("Unknown message type: ", message.type);
                break;
        }
    }

    const handlePlayNextSong = () => {
        setDisabled(true)
        if (song) {
            song.pause()
            song.unload()
        }
        if (index<songs.length-1) {
            dispatch(setIndex(index+1))
        } else{
            dispatch(setIndex(0))
        }
    }

    const handlePlayPrevSong = () => {
        setDisabled(true)
        if (song) {
            song.pause()
            song.unload()
        }
        if (index>=1) {
            dispatch(setIndex(index-1))
        } else {
            dispatch(setIndex(songs.length-1))
        }
    }

    const randomizeSong = (min: number, max: number) => {
        min = Math.ceil(min)
        max = Math.ceil(max)
        dispatch(setIndex(Math.floor(Math.random()*(max-min+1)) + min))
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
            <div className={`${isOpen ? "ml-[250px] max-w-custom" : "ml-[50px] max-w-custom2"} player-container`}>
                <div className='player-content'>
                    <div className="progress-container">
                        <div className="timer">
                            {mins}:{secs < 10 ? "0" + secs : secs}
                        </div>
                        <ReactSlider
                            className="progress-slider"
                            onAfterChange={handleSeek}
                            value={progress}
                            min={0}
                            max={duration}
                            thumbClassName="progress-thumb"
                            trackClassName="progress-track"
                        />
                        <div className='total-time'>
                            {Tmins}:{Tsecs < 10 ? "0" + Tsecs : Tsecs}
                        </div>
                    </div>

                    <div className='controls-container'>
                        <div className='player-left-controls'>   
                            <div className={randomize ? 'shuffle-active' : 'shuffle-inactive'} onClick={() => setRandomize(!randomize)}>
                                <FaRandom size={18} />
                            </div>
                            <div className={repeat ? 'repeat-active' : 'repeat-inactive'} onClick={() => setRepeat(!repeat)}>
                                <MdOutlineLoop size={20} />
                            </div>
                        </div>     
                        <div className='player-main-controls'>
                            <button disabled={(socket!==null && !isAdmin)} className="prev-button" onClick={handlePlayPrevSong}>
                                <FaBackwardStep size={16}/>
                            </button>
                            <button
                                disabled={(socket!==null && !isAdmin)}
                                onClick={handleClick}
                                className={disabled ? "play-button disabled" : "play-button"}
                            >
                                {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} className="play-icon" />}
                            </button>
                            <button disabled={(socket!==null && !isAdmin)} className="next-button" onClick={handlePlayNextSong}>
                                <FaForwardStep size={16}/>
                            </button>
                        </div>
                        <div className="player-right-controls">
                            <button className="equalizer-button" onClick={() => setShowEqualizer(!showEqualizer)}>
                                <FaSlidersH size={16} />
                            </button>
                            <button className="mute-button" onClick={handleVolumeMute}>
                                {isMuted ? <FaVolumeMute size={14} /> : <FaVolumeUp size={14} />}
                            </button>
                            <ReactSlider
                                className="volume-slider"
                                value={volume}
                                onChange={handleVolumeSeek}
                                min={0}
                                max={1}
                                step={0.01}
                                thumbClassName="volume-thumb"
                                trackClassName="volume-track"
                            />
                        </div>
                    </div>
                    
                    {showEqualizer && (
                        <div className="equalizer-panel">
                            <div className="equalizer-title">Sound Profiles</div>
                            <div className="sound-profiles">
                                <button 
                                    className={`profile-button ${soundProfile === 'normal' ? 'active' : ''}`}
                                    onClick={() => handleSoundProfileChange('normal')}>
                                    Normal
                                </button>
                                <button 
                                    className={`profile-button ${soundProfile === 'bass' ? 'active' : ''}`}
                                    onClick={() => handleSoundProfileChange('bass')}>
                                    Bass Boost
                                </button>
                                <button 
                                    className={`profile-button ${soundProfile === 'vocals' ? 'active' : ''}`}
                                    onClick={() => handleSoundProfileChange('vocals')}>
                                    Vocal Boost
                                </button>
                                <button 
                                    className={`profile-button ${soundProfile === 'rock' ? 'active' : ''}`}
                                    onClick={() => handleSoundProfileChange('rock')}>
                                    Rock
                                </button>
                                <button 
                                    className={`profile-button ${soundProfile === 'electronic' ? 'active' : ''}`}
                                    onClick={() => handleSoundProfileChange('electronic')}>
                                    Electronic
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}
    </>
    )
}