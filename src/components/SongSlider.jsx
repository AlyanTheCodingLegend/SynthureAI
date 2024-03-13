"use client";

import { Howl } from 'howler';
import { useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import ReactSlider from 'react-slider';

const supabase = createClient("https://uddenmrxulkqkllfwxlp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZGVubXJ4dWxrcWtsbGZ3eGxwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NTYyNTEsImV4cCI6MjAyNTMzMjI1MX0.GjFgG0vfES2dzl6s8YlFbTz8N06G0MbMo6Ornj39XAI")

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
    const [selectedFile, setSelectedFile] = useState(new File([""],""))
    const [songs, setSongs] = useState([])
    const [filename, setFilename] = useState("")
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
                volume: volume,
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
                    if (index<songs.length-1) {
                        setIndex(index+1)
                    }
                    else {
                        setIndex(0)
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

    const handleFileUpload = async () => {
        if (!selectedFile) {
            console.log("No file selected!");
            return;
        }
    
        console.log(selectedFile.name);
        try {
            const { data, error } = await supabase
                .storage
                .from("songs")
                .upload(`${filename}.mp3`, selectedFile, {cacheControl: "3600", upsert: false});
    
            if (error) {
                throw error;
            } else {
                console.log(data)
            }
    
            console.log("File uploaded successfully:", data);
        } catch (error) {
            console.error("Error uploading file:", error.message);
        }
    };

    const handleNameChange = (event) => {
        setFilename(event.target.value.replace(/\s+/g, '').toLowerCase());
    }

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0])
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
        <div className="progress-slider-container">
            <ReactSlider id="1" className="progress-slider h-6 bg-gray-200 rounded-md shadow-md my-6 mx-14"
            value={progress}
            onChange={handleSeek} 
            min={0}
            max={duration}
            thumbClassName="progress-thumb absolute w-6 h-10 hover:cursor-pointer bg-green-700 hover:bg-green-400 rounded-full outline-none -top-1/3"
            trackClassName="h-full bg-red-700 hover:cursor-pointer rounded-full"
            />
            <div className="progress-bar ease-in-out duration-75" style={{ width: `${(progress / duration) * 100}%` }} />
        </div>
            <button id="play" type="button" className="bg-red-700 hover:bg-red-500 mx-64 my-6 rounded-full text-white text-xl text-center h-20 w-40" onClick={handleClick}>
                {isPlaying ? "Pause Song" : "Play Song"}
            </button>
            <ReactSlider id="2" className="h-6 bg-gray-200 rounded-md shadow-md my-6 mx-14"
            value={volume}
            onChange={handleVolumeSeek} 
            min={0}
            max={1}
            step={0.1}
            thumbClassName="absolute w-6 h-10 hover:cursor-pointer bg-green-700 hover:bg-green-400 rounded-full outline-none -top-1/3"
            trackClassName="h-full bg-red-700 hover:cursor-pointer rounded-full"
            />
            <form>
                <div className="form-group mx-5">
                    <input onChange={handleNameChange} type="name" className="form-control" id="songname" aria-describedby="songName" placeholder="Enter song name"/>
                    <input onChange={handleFileChange} type="file" name="upload" accept=".mp3" multiple={false}/>
                    <button className="bg-red-700 rounded-full h-20 w-40 text-xl text-white hover:bg-red-500" onClick={handleFileUpload}>Upload Song</button>
                </div>
            </form>
        </>
    )
}