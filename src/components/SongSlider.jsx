"use client";

import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReactSlider from 'react-slider';

const supabase = createClient('https://uddenmrxulkqkllfwxlp.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZGVubXJ4dWxrcWtsbGZ3eGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NTYyNTEsImV4cCI6MjAyNTMzMjI1MX0.GjFgG0vfES2dzl6s8YlFbTz8N06G0MbMo6Ornj39XAI')

async function loopSongs () {
    let songArray=[]
    const { count } = await supabase.from("song_information").select("*",{count: "exact", head: true})
    const { data } = await supabase.from("song_information").select("song_path")
    
    for (let i=0;i<count;i++) {
        songArray.push(data[i].song_path.split(",")[0])
    }
    
    return songArray
}

export default function SongSlider () {
    const [isPlaying, setIsPlaying] = useState(false)
    const [song, setSong] = useState(null)
    const [duration, setDuration] = useState(0)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(1)
    const [index, setIndex] = useState(0)
    const [songs, setSongs] = useState([])
    const idRef = useRef(null)
    
    useEffect(() => {

        async function fetchSong() {

            let songArray = await loopSongs()
            setSongs(songArray)
        }
        fetchSong()
    // eslint-disable-next-line
    },[])

    useEffect(() => {
        if (songs.length>0) {
            var newSong = new Howl({
                src: [songs[index]],
                format: ["mp3"],
                volume: 1,
                onplay: () => {
                    setIsPlaying(true);
                },
                onpause: () => {
                    setIsPlaying(false);
                },
                onload: () => {
                    if (index>=1) {
                        newSong.play()
                        setIsPlaying(true)
                    }
                    setDuration(newSong.duration());
                },
                onend: () => {
                    setIsPlaying(false);
                    setProgress(0);
                    if (index<songs.length-1) {
                        setIndex(index+1)
                    }
                    else {
                        setIndex(0)
                    }
                }
            })
            setSong(newSong)
        }
    // eslint-disable-next-line
    }, [songs, index])

    const playNext = () => {
        if (index<songs.length-1) {
            setIndex(index+1)
        }
        else {
            setIndex(0)
        }
    }

    const handleClick = () => {
        if (!isPlaying) {
            idRef.current = song.play()
        } else {
            song.pause(idRef.current)
        }    
    }

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

    if (!song) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    
    return (
        <>
            <ReactSlider id="1" className="h-6 bg-gray-200 rounded-md shadow-md my-32 mx-14"
            value={progress}
            onChange={handleSeek} 
            min={0}
            max={duration}
            thumbClassName="absolute w-6 h-10 hover:cursor-pointer bg-green-700 hover:bg-green-400 rounded-full outline-none -top-1/3"
            trackClassName="h-full bg-red-700 hover:cursor-pointer rounded-full"
            />
            <button id="play" type="button" className="bg-red-700 hover:bg-red-500 mx-64 my-16 rounded-full text-white text-xl text-center h-20 w-40" onClick={handleClick}>
                {isPlaying ? "Pause Song" : "Play Song"}
            </button>
            <ReactSlider id="2" className="h-6 bg-gray-200 rounded-md shadow-md my-12 mx-14"
            value={volume}
            onChange={handleVolumeSeek} 
            min={0}
            max={1}
            step={0.1}
            thumbClassName="absolute w-6 h-10 hover:cursor-pointer bg-green-700 hover:bg-green-400 rounded-full outline-none -top-1/3"
            trackClassName="h-full bg-red-700 hover:cursor-pointer rounded-full"
            />
            <button id="forward" type="button" className="bg-red-700 hover:bg-red-500 mx-64 my-16 rounded-full text-white text-xl text-center h-20 w-40" onClick={playNext}>
                {"Forward"}
            </button>
        </>
    )
}