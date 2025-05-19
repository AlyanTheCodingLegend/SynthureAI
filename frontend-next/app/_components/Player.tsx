"use client";

import { Howl } from 'howler';
import { useEffect, useState, type JSX, useRef } from 'react';
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
    const [isCreatingSong, setIsCreatingSong] = useState<boolean>(false)
    
    const songRef = useRef<Howl | null>(null);
    const lastIndexRef = useRef<number>(-1);
    
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

    // Update time display
    useEffect(() => {
        if (isPlaying || progress > 0) {
            setMins(Math.trunc(progress/60))
            setSecs(Math.trunc(progress-(mins*60)))
            setTMins(Math.trunc(duration/60))
            setTSecs(Math.trunc(duration-(Tmins*60)))
        }
    // eslint-disable-next-line    
    }, [progress, isPlaying, duration])    
 
    // Keep a reference to the song for closures
    useEffect(() => {
        songRef.current = song;
    }, [song]);

    useEffect(() => {
        console.log("songs changing", songs);
    }, [songs]);
    
    // Create a new song when index changes
    useEffect(() => {
        if (songs.length > 0 && index >= 0 && index < songs.length && !isCreatingSong && index !== lastIndexRef.current) {
            console.log(`Creating new song for index ${index}, last index was ${lastIndexRef.current}`);
            lastIndexRef.current = index;
            setIsCreatingSong(true);
            
            // Unload previous song to prevent memory leaks
            if (song) {
                song.unload();
            }
            
            const newSong = new Howl({
                src: [songs[index]],
                format: ["mp3"],
                volume: volume,
                loop: repeat,
                onplay: () => {
                    setIsPlaying(true);
                    if (socket !== null && isAdmin) {
                        socket?.send(JSON.stringify({ 
                            type: "play", 
                            sessionID: sessionID,
                            index: index,
                            progress: song?.seek() || 0
                        }));
                    }    
                },
                onpause: () => {
                    setIsPlaying(false);
                    if (socket !== null && isAdmin) {
                        socket?.send(JSON.stringify({ 
                            type: "pause", 
                            sessionID: sessionID,
                            progress: song?.seek() || 0
                        }));
                    }
                },
                onload: () => {
                    dispatch(setDuration(newSong.duration()));
                    setDisabled(false);
                    setIsCreatingSong(false);
                    
                    if (socket !== null && isAdmin) {
                        socket?.send(JSON.stringify({ 
                            type: "nextsong", 
                            sessionID: sessionID, 
                            index: index 
                        }));
                    } 
                },
                onloaderror: (id, error) => {
                    console.error("Error loading song:", error);
                    setIsCreatingSong(false);
                    setDisabled(false);
                    toast.error("Failed to load song");
                },
                onend: () => {
                    setIsPlaying(false);
                    dispatch(setProgress(0));
                    if (randomize) {
                        randomizeSong(0, songs.length-1);
                    } else {
                        if (index < songs.length-1) {
                            dispatch(setIndex(index+1));
                        }
                        else {
                            dispatch(setIndex(0));
                        }
                    } 
                }
            });
            
            setSong(newSong);
        }
    // eslint-disable-next-line
    }, [songs, index]);

    // Handle playback actions
    const handleClick = () => {
        if (!song) {
            console.log("No song loaded yet");
            return;
        }
        
        if (isPlaying) {
            song.pause();
        }
        else {
            song.play();  
        }
    };

    // Progress tracking
    useEffect(() => {
        const interval = setInterval(() => {
            if (song && isPlaying) {
                const currentPos = song.seek() || 0;
                dispatch(setProgress(currentPos));
            }
        }, 100);

        return () => clearInterval(interval);
    }, [song, isPlaying, dispatch]);
 
    // Seeking
    const handleSeek = (position: number) => {
        if (!song) {
            console.log("Cannot seek: no song loaded");
            return;
        }
       
        if (position <= duration) {
            song.seek(position);
            dispatch(setProgress(position));
            
            if (socket !== null && isAdmin) {
                socket?.send(JSON.stringify({ 
                    type: "seek", 
                    sessionID: sessionID, 
                    time: position 
                }));
            }
        }
    };

    // Volume control
    const handleVolumeSeek = (vol: number) => {
        if (song) {
            song.volume(vol);
        }    
        setVolume(vol);
    };

    // Mute toggle
    const handleVolumeMute = () => {
        if (!isMuted) {
            setPrevVol(volume);
            if (song) {
                song.volume(0);
            }    
            setVolume(0);
        } else {
            if (song) {
                song.volume(prevVol);
            }    
            setVolume(prevVol);
        }
        setIsMuted(!isMuted);
    };

    // Sound profile change
    const handleSoundProfileChange = (profile: string) => {
        setSoundProfile(profile);
        toast.info(`Sound profile changed to ${profile}`, toast_style);
        // In a real implementation, this would apply audio effects
    };

    // Auto-play song once loaded/created
    useEffect(() => {
        if (song && duration > 0 && !disabled && isPlaying) {
            console.log("Auto-playing song after load");
            song.play();
        }      
    // eslint-disable-next-line   
    }, [duration, song, disabled]);

    // Socket connection and message handling
    useEffect(() => {
        if (!socket) return;
        
        const onOpen = () => {
            console.log("WebSocket connected");
            socket.send(JSON.stringify({ 
                type: "join", 
                sessionID: sessionID, 
                userID: userID, 
                isAdmin: isAdmin 
            }));
        };
        
        const onMessage = (event: MessageEvent) => {
            handleMessage(event.data);
        };
        
        const onClose = () => {
            console.log("WebSocket disconnected");
            dispatch(setSessionID(-1));
            dispatch(setIsAdmin(false));
            dispatch(setSocket(null));
            toast.info("Disconnected from session");
        };
        
        const onError = (error: Event) => {
            console.error("WebSocket error:", error);
            toast.error("Connection error occurred!");
        };
        
        // Assign all the handlers
        socket.onopen = onOpen;
        socket.onmessage = onMessage;
        socket.onclose = onClose;
        socket.onerror = onError;
        
        // Clean up on component unmount
        return () => {
            socket.onopen = null;
            socket.onmessage = null;
            socket.onclose = null;
            socket.onerror = null;
        };
    }, [socket, sessionID, userID, isAdmin, dispatch]);    

    // Socket message handler
    const handleMessage = (data: string) => {
        try {
            const message = JSON.parse(data);
            console.log("Received message:", message.type);

            switch (message.type) {
                case "sync":
                    console.log("Sync received:", message);
                    if (message.songs && message.songs.length > 0) {
                        dispatch(setSongs(message.songs));
                    }
                    
                    if (message.index !== undefined) {
                        dispatch(setIndex(message.index));
                    }
                    
                    if (message.duration) {
                        dispatch(setDuration(message.duration));
                    }
                    
                    if (message.progress !== undefined) {
                        dispatch(setProgress(message.progress));
                        
                        // Update the current song position if it exists
                        if (song) {
                            song.seek(message.progress);
                        }
                    }
                    
                    // Apply play state if specified
                    if (message.isPlaying !== undefined) {
                        if (message.isPlaying && song) {
                            song.play();
                        } else if (!message.isPlaying && song) {
                            song.pause();
                        }
                    }
                    break;
                    
                case "nextsong":
                    console.log("Next song received:", message.index);
                    if (message.index !== undefined) {
                        dispatch(setIndex(message.index));
                    }
                    break;
                    
                case "play":
                    console.log("Play command received");
                    if (song) {
                        song.play();
                    } else {
                        console.warn("Received play command but song is null");

                        console.log(songs.length, index, isCreatingSong);
                        
                        // If we have songs but no song object, try to create one
                        if (songs.length > 0 && index >= 0 && index < songs.length && !isCreatingSong) {
                            console.log("Creating song on play command");
                            createSong(index);
                        }
                    }
                    break;
                    
                case "pause":
                    console.log("Pause command received");
                    if (song) {
                        song.pause();
                    }
                    
                    // Update progress if provided
                    if (message.progress !== undefined) {
                        dispatch(setProgress(message.progress));
                    }
                    break;
                    
                case "seek":
                    console.log("Seek command received:", message.time);
                    handleSeek(message.time);
                    break;
                    
                case "syncRequest":
                    console.log("Sync request received from user:", message.userID);
                    if (isAdmin) {
                        sendFullSync(message.userID);
                    }
                    break;
                    
                case "requestCurrentState":
                    console.log("State request received");
                    if (isAdmin) {
                        sendFullSync();
                    }
                    break;
                    
                case "adminPromoted":
                    console.log("Promoted to admin!");
                    dispatch(setIsAdmin(true));
                    toast.success(message.message);
                    break;
                    
                case "userDisconnected":
                    console.log("User disconnected:", message.userID);
                    if (message.wasAdmin) {
                        toast.info("Admin disconnected");
                    }
                    break;
                    
                case "joinsuccess":
                    console.log("Join success:", message.message);
                    toast.success(message.message);
                    
                    // If not admin, request a sync
                    if (!isAdmin) {
                        requestSync();
                    }
                    break;
                    
                case "joinerror":
                    console.log("Join error:", message.message);
                    if (socket) socket.close();
                    toast.error(message.message);
                    break;
                    
                case "leavesuccess":
                    console.log("Leave success:", message.message);
                    toast.success(message.message);
                    if (socket) socket.close();
                    break;
                    
                case "leaveerror":
                    console.log("Leave error:", message.message);
                    toast.error(message.message);
                    break;
                    
                case "error":
                    console.error("Server error:", message.message);
                    toast.error(message.message);
                    break;
                    
                default:
                    console.warn("Unknown message type:", message.type);
                    break;
            }
        } catch (error) {
            console.error("Error parsing message:", error);
        }
    };

    // Helper to create a song explicitly
    const createSong = (songIndex: number) => {
        if (songs.length === 0 || songIndex < 0 || songIndex >= songs.length || isCreatingSong) {
            return;
        }
        
        setIsCreatingSong(true);
        
        // Unload previous song to prevent memory leaks
        if (song) {
            song.unload();
        }
        
        console.log(`Explicitly creating song for index ${songIndex}`);
        const newSong = new Howl({
            src: [songs[songIndex]],
            format: ["mp3"],
            volume: volume,
            loop: repeat,
            onplay: () => {
                setIsPlaying(true);
            },
            onpause: () => {
                setIsPlaying(false);
            },
            onload: () => {
                dispatch(setDuration(newSong.duration()));
                setDisabled(false);
                setIsCreatingSong(false);
                
                // Auto-play if requested
                if (isPlaying) {
                    newSong.play();
                }
            },
            onloaderror: (id, error) => {
                console.error("Error loading song:", error);
                setIsCreatingSong(false);
                setDisabled(false);
                toast.error("Failed to load song");
            },
            onend: () => {
                setIsPlaying(false);
                dispatch(setProgress(0));
                if (randomize) {
                    randomizeSong(0, songs.length-1);
                } else {
                    if (songIndex < songs.length-1) {
                        dispatch(setIndex(songIndex+1));
                    }
                    else {
                        dispatch(setIndex(0));
                    }
                } 
            }
        });
        
        setSong(newSong);
    };

    // Request sync from admin
    const requestSync = () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log("Requesting sync from admin");
            socket.send(JSON.stringify({ 
                type: "requestSync", 
                sessionID: sessionID, 
                userID: userID 
            }));
        }
    };

    // Send full sync to all users or specific user
    const sendFullSync = (targetUserID?: string) => {
        if (!isAdmin || !socket || socket.readyState !== WebSocket.OPEN) {
            return;
        }
        
        console.log("Sending full sync", targetUserID ? `to user ${targetUserID}` : "to all users");
        
        const syncMessage = {
            type: "sync",
            sessionID: sessionID,
            userID: userID,
            targetUserID: targetUserID, // Only used if sending to specific user
            songs: songs,
            index: index,
            duration: duration,
            progress: song ? song.seek() || progress : progress,
            isPlaying: isPlaying
        };
        
        socket.send(JSON.stringify(syncMessage));
    };

    // Play next song
    const handlePlayNextSong = () => {
        if (disabled) return;
        
        setDisabled(true);
        if (song) {
            song.pause();
            song.unload();
        }
        
        if (index < songs.length-1) {
            dispatch(setIndex(index+1));
        } else {
            dispatch(setIndex(0));
        }
    };

    // Play previous song
    const handlePlayPrevSong = () => {
        if (disabled) return;
        
        setDisabled(true);
        if (song) {
            song.pause();
            song.unload();
        }
        
        if (index >= 1) {
            dispatch(setIndex(index-1));
        } else {
            dispatch(setIndex(songs.length-1));
        }
    };

    // Sync session button handler
    const syncSession = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        if (isAdmin) {
            sendFullSync();
        } else {
            requestSync();
        }
    };

    // Random song selection
    const randomizeSong = (min: number, max: number) => {
        min = Math.ceil(min);
        max = Math.ceil(max);
        dispatch(setIndex(Math.floor(Math.random() * (max - min + 1)) + min));
    };

    // Update mute state based on volume
    useEffect(() => {
        if (isMuted && volume !== 0) {
            setIsMuted(false);
        }
        if (volume === 0) {
            setIsMuted(true);
        }
    // eslint-disable-next-line    
    }, [volume]);

    return (
        <>
        {(songs && songs.length > 0 && song) && (
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
                        max={duration || 100} // Prevent division by zero
                        thumbClassName="progress-thumb"
                        trackClassName="progress-track"
                        disabled={!song || disabled || songs.length === 0 || isCreatingSong || (socket !== null && !isAdmin && sessionID!==-1)}
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
                        <div className={repeat ? 'repeat-active' : 'repeat-inactive'} onClick={() => {
                            setRepeat(!repeat);
                            if (song) song.loop(!repeat);
                        }}>
                            <MdOutlineLoop size={20} />
                        </div>
                        <button className="bg-white p-2 rounded" disabled={!socket} onClick={syncSession}>
                            {isAdmin ? "Sync All" : "Request Sync"}
                        </button>
                        <div className="debug-info text-sm text-gray-600 ml-2 mt-1 mb-2 w-[180px]">
                            {songs.length > 0 ? `Song ${index+1}/${songs.length}` : "No songs loaded"}
                            {song ? "" : " - No active song object"}
                            {isCreatingSong ? " - Creating song..." : ""}
                        </div>
                    </div>     
                    <div className='player-main-controls'>
                        <button 
                            disabled={(socket !== null && !isAdmin) || disabled || songs.length === 0} 
                            className="prev-button" 
                            onClick={handlePlayPrevSong}
                        >
                            <FaBackwardStep size={16}/>
                        </button>
                        <button
                            disabled={(socket !== null && !isAdmin) || disabled || songs.length === 0 || isCreatingSong}
                            onClick={handleClick}
                            className={((socket !== null && !isAdmin) || disabled || songs.length === 0 || isCreatingSong) ? "play-button disabled" : "play-button"}
                        >
                            {isPlaying ? <FaPause size={18} /> : <FaPlay size={18} className="play-icon" />}
                        </button>
                        <button 
                            disabled={(socket !== null && !isAdmin) || disabled || songs.length === 0} 
                            className="next-button" 
                            onClick={handlePlayNextSong}
                        >
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