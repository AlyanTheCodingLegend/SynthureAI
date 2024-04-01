"use client";

import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReactSlider from 'react-slider';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)

async function loopSongs () {
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

            let [songArray, songNameArray] = await loopSongs()
            setSongs(songArray)
            setSongNames(songNameArray)
        }
        fetchSong()
    // eslint-disable-next-line
    },[])

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
    }, [songs, index, songNames])

    const handleClick = () => {
        if (!isPlaying) {
            idRef.current = song.play()
        } else {
            song.pause(idRef.current)
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
        if (isMuted) {
            setIsMuted(false)
        }
    // eslint-disable-next-line    
    }, [volume])

    // TODO: repeat song button (partially done)
    // TODO: song autoplay switch
    // TODO: front-end styling

    if (!song) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    
    return (
        <div className="flex flex-col h-screen relative">

            <div>Playing {songNames[index]}</div>

            <button id="play" type="button" className="bg-red-700 hover:bg-red-500 rounded-full text-white text-xl text-center h-20 w-40" onClick={handleClick}>
                {isPlaying ? "Pause Song" : "Play Song"}
            </button>

            <button className='bg-red-800 hover:bg-red-400 rounded-full' onClick={handlePlayNextSong}>Next Song</button>
            <button className='bg-green-800 hover:bg-green-400 rounded-full' onClick={handlePlayPrevSong}>Prev Song</button>
            <button className="bg-red-600 rounded-full h-8 w-35 text-white" onClick={() => setRepeat(!repeat)}>{repeat ? "Repeat: On" : "Repeat: Off"}</button>
            <button className="bg-black text-white rounded-full h-8 w-35" onClick={handleVolumeMute}>{isMuted ? "Muted" : "Unmuted"}</button>
            <button onClick={() => setRandomize(!randomize)}>{randomize ? "Un-randomize" : "Randomize"}</button>
            
            <div className="justify-center bg-slate-300">
                {songNames.map((songName, index) => (
                    <button key={index} className='mr-10 bg-red-300 rounded-full justify-center hover:bg-gradient-to-r from-white to-green-600' onClick={() => {song.pause(); setIndex(index)}}>{songName}</button>
                ))}
            </div>
            
            <div className='fixed bottom-7 flex flex-col w-full ml-44'>    
                <div className="w-full">
                    <ReactSlider
                    id="song-slider"
                    className="h-3 bg-white rounded-md shadow-md w-1/2"
                    onAfterChange={handleSeek}
                    value={progress}
                    min={0}
                    max={duration}
                    thumbClassName="progress-thumb absolute w-5 h-5 hover:cursor-pointer bg-blue-700 hover:bg-blue-500 rounded-full -top-1/3 outline-none"
                    trackClassName="h-full hover:cursor-pointer rounded-full bg-gradient-to-r from-blue-300 to-green-200"
                    />
                    <div className="progress-bar ease-in-out duration-75" style={{ width: `${(progress / duration) * 100}%` }} />
                </div>  
                <div id="timer" className='font-mono text-base w-1/2 text-blue-600 text-center ml-40'>
                        {mins}:{secs} / {Tmins}:{Tsecs}
                </div>
            </div> 

            <div className='fixed right-0 h-full w-1/4 bg-gray-800 opacity-0 hover:opacity-100 transition-opacity duration-300'>
                <ReactSlider id="volume-slider" className="w-6 bg-white rounded-md shadow-md h-40 transform rotate-90"
                value={volume}
                onChange={handleVolumeSeek} 
                min={0}
                max={1}
                step={0.001}
                thumbClassName="absolute w-6 h-10 hover:cursor-pointer bg-green-700 hover:bg-green-400 rounded-full outline-none -right-1/3"
                trackClassName="w-full bg-red-700 hover:cursor-pointer rounded-full"
                />
            </div>
            
        </div>
    )
}