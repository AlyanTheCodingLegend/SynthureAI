"use client";

import { Howl } from 'howler';
import React, { useEffect, useState } from 'react';
//import { LiveAudioVisualizer } from 'react-audio-visualize';
import { toast, ToastContainer } from "react-toastify";
import ReactSlider from 'react-slider';
import supabase from "./ClientInstance";
import toast_style from './ToastStyle';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlay, FaPause, FaForwardStep, FaBackwardStep } from "react-icons/fa6";
import { FaVolumeMute, FaVolumeUp, FaRandom } from "react-icons/fa";
import { MdOutlineLoop } from "react-icons/md";


export default function Player ({isOpen, songs, index, setIndex}) {
    const [isPlaying, setIsPlaying] = useState(false)
    const [song, setSong] = useState(null)
    const [duration, setDuration] = useState(0)
    const [progress, setProgress] = useState(0)
    const [volume, setVolume] = useState(1)
    const [repeat, setRepeat] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [prevVol, setPrevVol] = useState(0)
    const [mins, setMins] = useState(0)
    const [secs, setSecs] = useState(0)
    const [Tmins, setTMins] = useState(0)
    const [Tsecs, setTSecs] = useState(0)
    const [randomize, setRandomize] = useState(false)
    // const [mediaRecorder, setMediaRecorder] = useState(null)
    const [disabled, setDisabled] = useState(false)

    useEffect(() => {
        if (isPlaying) {
            setMins(Math.trunc(progress/60))
            setSecs(Math.trunc(progress-(mins*60)))
            setTMins(Math.trunc(duration/60))
            setTSecs(Math.trunc(duration-(Tmins*60)))
        }
    // eslint-disable-next-line    
    }, [progress, isPlaying, duration])    

    // useEffect(() => {
        
    //     if (songs && songs.length > 0 && index !== null && index !== undefined) {
    //         fetch(songs[index])
    //             .then(response => response.blob())
    //             .then(blob => {
                    
    //                 return blob.arrayBuffer();
    //             })
    //             .then(arrayBuffer => {
    //                 const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
    //                 audioContext.decodeAudioData(arrayBuffer, audioBuffer => {
    //                     const audioTrack = audioContext.createMediaStreamDestination().stream.getAudioTracks()[0];
    //                     const mediaStream = new MediaStream([audioTrack]);
    //                     const mediaRecorderRef = new MediaRecorder(mediaStream);
    //                     setMediaRecorder(mediaRecorderRef)
    //                 });
    //             })
    //             .catch(error => {
    //                 toast.error('Error fetching audio',toast_style);
    //             });
    //     }
        
    // }, [songs, index]);
       
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
                    setDisabled(false);
                    //updateCounter();
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
            // if (mediaRecorder) {    
            //     if (mediaRecorder.state==="inactive") {
            //         mediaRecorder.stop()
            //     }
            //     else {
            //         mediaRecorder.pause()
            //     }
            // }    
        }
        else {
            if (song) {
                song.play()
            }
            // if (mediaRecorder) {
            //     if (mediaRecorder.state==="inactive") {    
            //         mediaRecorder.start()
            //     }
            //     else {
            //         mediaRecorder.resume()
            //     }    
            // }    
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

    // async function updateCounter() {
    //     try {
    //         const {data, error} = await supabase.from('playcount_information').select("*").eq('song_id',indexes[index])
    //         if (error) throw error
    //         if (data.length===0) { // no row
    //             const {error: errorTwo} = await supabase.from('playcount_information').insert({song_id: indexes[index], dailycount: 1, monthlycount: 1, alltimecount: 1})

    //             if (errorTwo) throw errorTwo
    //         } else { // song has row
    //             const {error: errorThree} = await supabase.from('playcount_information').update({dailycount: data[0].dailycount+1, monthlycount: data[0].monthlycount+1, alltimecount: data[0].alltimecount+1}).eq('song_id',indexes[index])

    //             if (errorThree) throw errorThree
    //         }
    //     } catch (error) {
    //         toast.error(error.message, toast_style)
    //     }
    // }
    
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
        if (index!==0) {
            song.play()
        }  
    // eslint-disable-next-line   
    }, [duration])

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
                            id="song-slider"
                            className="flex-grow h-2 bg-gray-700 rounded-md mx-1 cursor-pointer"
                            onAfterChange={handleSeek}
                            value={progress}
                            min={0}
                            max={duration}
                            thumbClassName="w-4 h-4 bg-purple-400 hover:bg-purple-900 rounded-full -mt-1 outline-none focus:outline-none -top-1/6 cursor-pointer"
                            trackClassName="h-full rounded-full bg-gradient-to-r from-gray-300 to-purple-600"
                        />
                        <div className='font-mono -mt-1.5 text-base text-center text-white mr-1'>
                            {Tmins}:{Tsecs < 10 ? "0" + Tsecs : Tsecs}
                        </div>
                    </div>

                    <div className='flex flex-row items-center w-full justify-end'>
                    <div className='flex items-center mr-10 w-2/5 justify-center'>
                        <button className="text-white mr-4 hover:text-green-500" onClick={handlePlayPrevSong}><FaBackwardStep size={20}/></button>
                        
                            <button
                                disabled={disabled}
                                onClick={handleClick}
                                className={disabled ? "text-white mr-2 rounded-full h-8 w-8 bg-slate-600 text-xs text-center cursor-not-allowed flex items-center justify-center" : "text-white mr-2 rounded-full h-8 w-8 bg-purple-900 text-xs text-center flex items-center justify-center"}
                            >
                                {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                            </button>
                            <button className="text-white ml-2 hover:text-green-500" onClick={handlePlayNextSong}><FaForwardStep size={20}/></button>
                        </div>
                        <div className={randomize ? 'text-white hover:cursor-pointer' : 'text-green-400 hover:cursor-pointer'} onClick={() => setRandomize(!randomize)}>
                            <FaRandom size={20} />
                        </div>
                        <div className={repeat ? 'text-white hover:cursor-pointer' : 'text-green-400 hover:cursor-pointer'} onClick={() => setRepeat(!repeat)}>
                            <MdOutlineLoop size={20} />
                        </div>
                        <div className="flex items-center w-1/5 justify-end">
                            <button className="flex justify-center items-center text-white mr-1 rounded-full bg-blue-900 hover:bg-blue-800 w-10 h-6 text-xs text-center" onClick={handleVolumeMute}>
                                {isMuted ? <FaVolumeMute size={15} /> : <FaVolumeUp size={15} />}
                            </button>
                            <ReactSlider
                                id="volume-slider"
                                className="h-2 rounded-md w-full"
                                value={volume}
                                onChange={handleVolumeSeek}
                                min={0}
                                max={1}
                                step={0.01}
                                thumbClassName="w-4 h-4 bg-green-400 rounded-full -mt-1 outline-none focus:outline-none hover:bg-blue-400 cursor-pointer"
                                trackClassName="h-full rounded-full bg-gradient-to-l from-blue-400 to-green-400"
                            />
                        </div>
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark' />
            </div>
        )}
    </>
    )
}
