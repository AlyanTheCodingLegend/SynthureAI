"use client";

import { Howl } from 'howler';
import React, { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BeatLoader } from 'react-spinners';
import { LiveAudioVisualizer } from 'react-audio-visualize';
import ReactSlider from 'react-slider';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)

async function loadSongs () {
    let songArray=[]
    let songNameArray=[]
    const { count } = await supabase.from("song_information").select("*",{count: "exact", head: true})
    const { data } = await supabase.from("song_information").select("song_name,song_path")
    
    for (let i=0;i<count;i++) {
        songArray.push(data[i].song_path.split(",")[0])
        songNameArray.push(data[i].song_name.split(",")[0])
    }
    
    return [songArray, songNameArray]
}

export default function Player () {
    const [isPlaying, setIsPlaying] = useState(false)
    const [song, setSong] = useState(null)
    const [duration, setDuration] = useState(0)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(1)
    const [index, setIndex] = useState(0)
    const [songs, setSongs] = useState([])
    const [songNames, setSongNames] = useState([])
    const [repeat, setRepeat] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [prevVol, setPrevVol] = useState(0)
    const [mins, setMins] = useState(0)
    const [secs, setSecs] = useState(0)
    const [Tmins, setTMins] = useState(0)
    const [Tsecs, setTSecs] = useState(0)
    const [randomize, setRandomize] = useState(false)
    const [autoplay, setAutoplay] = useState(true)
    const [mediaRecorder, setMediaRecorder] = useState()
    const idRef = useRef(null)

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

        async function fetchSong() {

            let [songArray, songNameArray] = await loadSongs()
            setSongs(songArray)
            setSongNames(songNameArray)
            
        }
        fetchSong()
    // eslint-disable-next-line
    },[])

    useEffect(() => {
        if (songs && songs.length > 0 && index !== null && index !== undefined) {
            fetch(songs[index])
                .then(response => response.blob())
                .then(blob => {
                    
                    return blob.arrayBuffer();
                })
                .then(arrayBuffer => {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
                    audioContext.decodeAudioData(arrayBuffer, audioBuffer => {
                        const audioTrack = audioContext.createMediaStreamDestination().stream.getAudioTracks()[0];
                        const mediaStream = new MediaStream([audioTrack]);
                        const mediaRecorderRef = new MediaRecorder(mediaStream);
                        setMediaRecorder(mediaRecorderRef)
                        
                    });
                })
                .catch(error => {
                    console.error('Error fetching audio:', error);
                });
        }
        
    }, [songs, index]);
       

    useEffect(() => {
        if (songs.length>0) {
            var newSong = new Howl({
                src: [songs[index]],
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
                    setDuration(newSong.duration());
                },
                onend: () => {
                    setIsPlaying(false);
                    setProgress(0);
                    if (autoplay) {
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
                }
            })
            setSong(newSong)

            return () => {
                newSong.unload()
            }
        }
    // eslint-disable-next-line
    }, [songs, index, songNames])

    const handleClick = () => {
        if (!song) return;
    
        if (!isPlaying) {
            
            if (!idRef.current) {
                
                idRef.current = song.play();
            } else {
                
                song.play(idRef.current);
            }
        } else {
            
            song.pause(idRef.current);
        }
    
        setIsPlaying(!isPlaying);
    }
    

    useEffect(() => {
        const interval = setInterval(() => {
            if (song && isPlaying) {
                setProgress(song.seek() || 0);
            }
        }, 100);

        return () => clearInterval(interval);
    }, [song, isPlaying]);

    const handleSeek = (position) => {
        if (position<=duration) {
            song.seek(position)
            setProgress(position)
        }
    }

    const handleVolumeSeek = (vol) => {
        song.volume(vol)
        setVolume(vol)
    }

    const handleVolumeMute = () => {
        if (!isMuted) {
            setPrevVol(volume)
            song.volume(0)
            setVolume(0)
        } else {
            song.volume(prevVol)
            setVolume(prevVol)
        }
        setIsMuted(!isMuted)
    }

    useEffect(() => {
        if (autoplay) {
            if (index!==0) {
                song.play()
            }
        }    
    // eslint-disable-next-line   
    }, [duration])

    const handlePlayNextSong = () => {
        song.pause()
        if (index<songs.length-1) {
            setIndex(index+1)
        } else{
            setIndex(0)
        }
    }

    const handlePlayPrevSong = () => {
        song.pause()
        if (index>=1) {
            setIndex(index-1)
        } else {
            setIndex(songs.length-1)
        }
    }

    const randomizeSong = (min,max) => {
        min = Math.ceil(min)
        max = Math.ceil(max)
        setIndex(Math.floor(Math.random()*(max-min+1)) + min)
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

    if (!song) {
        return (
            <div className='flex w-full h-full justify-center items-center my-auto'>
                <BeatLoader size={30} color="lightblue"/>
            </div>
        )
    }
    
    return (
        <div className="flex flex-col h-screen w-screen bg-gray-900 text-white relative">

            <div className="flex justify-center items-center h-1/6">
                <div className="text-center">
                    <h1 className="text-3xl">Now Playing: {songNames[index]}</h1>
                    <div className="flex justify-center mt-4">
                        <button className='bg-green-600 hover:bg-green-400 rounded-full py-2 px-4 mr-4' onClick={handlePlayPrevSong}>Prev Song</button>
                        <button className='bg-red-600 hover:bg-red-400 rounded-full py-2 px-4 mr-4' onClick={handlePlayNextSong}>Next Song</button>
                        <button className="bg-blue-600 hover:bg-blue-400 rounded-full py-2 px-4 mr-4" onClick={() => setRepeat(!repeat)}>{repeat ? "Repeat: On" : "Repeat: Off"}</button>
                        <button className="bg-purple-600 hover:bg-purple-400 rounded-full py-2 px-4 mr-4" onClick={() => setAutoplay(!autoplay)}>{autoplay ? "Disable autoplay" : "Enable autoplay"}</button>
                        <button className='bg-pink-600 hover:bg-pink-400 rounded-full py-2 px-4' onClick={()=>setRandomize(!randomize)}>{randomize ? "Randomize: On" : "Randomize: Off"}</button>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex justify-center items-center bg-gray-800">
                <div className="flex flex-col justify-center items-center">
                    <div className="flex justify-center items-center w-80 h-80 bg-gray-700 rounded-full mb-8">
                        <div className="w-64 h-64 bg-gray-600 rounded-full relative">
                            {mediaRecorder && (<LiveAudioVisualizer mediaRecorder={mediaRecorder} width={150} height={75} backgroundColor='blue'/>)}
                        </div>
                    </div>
                    <h2 className="text-2xl">{songNames[index]}</h2>
                </div>
            </div>

            <div className='fixed bg-gray-800 bottom-0 flex flex-row w-full justify-between items-center p-4'>
                <div className="flex items-center">
                    <button disabled={!duration} onClick={handleClick} className="text-white mr-2 rounded-full h-8 w-8 bg-green-900 hover:bg-green-800 text-xs text-center">
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                    <div id="timer" className='font-mono text-base text-blue-600'>
                        {mins}:{secs} / {Tmins}:{Tsecs}
                    </div>
                </div>
                <ReactSlider
                    id="song-slider"
                    className="flex-grow h-3 bg-gray-700 rounded-md mx-4 cursor-pointer"
                    onAfterChange={handleSeek}
                    value={progress}
                    min={0}
                    max={duration}
                    thumbClassName="w-5 h-5 bg-blue-600 hover:bg-blue-800 rounded-full -mt-1 outline-none focus:outline-none top-px cursor-pointer"
                    trackClassName="h-full rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                />
                <div className="flex items-center w-1/5">
                    <button className="text-white mr-2 rounded-full bg-blue-900 hover:bg-blue-800 w-20 h-8 text-xs text-center" onClick={handleVolumeMute}>
                        {isMuted ? "Unmute" : "Mute"}
                    </button>
                    <ReactSlider
                        id="volume-slider"
                        className="h-3 rounded-md mx-4 w-full"
                        value={volume}
                        onChange={handleVolumeSeek}
                        min={0}
                        max={1}
                        step={0.01}
                        thumbClassName="w-5 h-5 bg-green-400 rounded-full -mt-1 outline-none focus:outline-none hover:bg-blue-400"
                        trackClassName="h-full rounded-full bg-gradient-to-l from-blue-400 to-green-400"
                    />
                </div>
            </div>
        </div>
    )
}