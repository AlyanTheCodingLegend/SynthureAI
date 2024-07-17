"use client";

import supabase from './ClientInstance';
import React, { useState } from 'react';
import { toast } from "react-toastify";
import toast_style from './ToastStyle';
import { IoMdClose } from "react-icons/io";
import { FadeLoader } from 'react-spinners';

type SongUploadModelProps = {
    username: string;
    onClick: () => void;
}

export default function SongUploadModel ({username, onClick}: SongUploadModelProps): JSX.Element {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [filename, setFilename] = useState<string>("")
    const [initialFilename, setInitialFilename] = useState<string>("")
    const [isProcessing, setIsProcessing] = useState<boolean>(false)
    const [artistName, setArtistName] = useState<string>("")
    const [imageFile, setImageFile] = useState<File | null>(null)

    const handleArtistRowUpdate = async (songID: number) => {
        try {
            const { data, error } = await supabase.from('artist_information').select('artist_id').eq('name', artistName)
            if (error) throw error;

            if (data.length === 0) {
                const { data: dataOne, error: errorOne } = await supabase.from('artist_information').insert({ name: artistName }).select()
                if (errorOne) throw errorOne;

                const { error: errorTwo } = await supabase.from('artistsong_information').insert({artist_id: dataOne[0].artist_id, song_id: songID})
                if (errorTwo) throw errorTwo;
            } else {
                const { error: errorThree } = await supabase.from('artistsong_information').insert({artist_id: data[0].artist_id, song_id: songID})
                if (errorThree) throw errorThree;
            }
        } catch (error: unknown) {
            if  (error instanceof Error) {
                toast.error(error.message, toast_style);
            }    
        }
    }

    const handleFileUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        if (!selectedFile || !imageFile) {
            toast.error("Please select both audio and image files!", toast_style);
            return;
        }

        setIsProcessing(true)

        try {
            const { error } = await supabase.storage.from("songs").upload(`${username}/${filename}.mp3`, selectedFile, { cacheControl: '3600', upsert: true, contentType: 'audio/mpeg' })
            if (error) throw error;

            const { error: errorOne } = await supabase.storage.from("images").upload(`${username}/${filename}.${imageFile.type.replace('image/', '')}`, imageFile, { cacheControl: '3600', upsert: true, contentType: imageFile.type })
            if (errorOne) throw errorOne;

            const { error: errorThree } = await supabase.from('image_information').insert({ uploaded_by: username, size: `${imageFile.size / (1024 * 1024)}`, format: `${imageFile.type}`, image_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/${username}/${filename}.${imageFile.type.replace('image/','')}` })
            if (errorThree) throw errorThree;

            const { data, error: errorTwo } = await supabase.from('song_information').insert({ song_name: initialFilename, song_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/songs/${username}/${filename}.mp3`, uploaded_by: username, artist_name: artistName, image_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/${username}/${filename}.${imageFile.type.replace('image/','')}` }).select()
            if (errorTwo) throw errorTwo;

            await handleArtistRowUpdate(data[0].id);

            toast.success("Song has been uploaded successfully!", toast_style)
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message, toast_style);
            }    
        } finally {
            setIsProcessing(false)
            resetForm();
        }
    };

    const resetForm = () => {
        setFilename("")
        setInitialFilename("")
        setArtistName("")
        setSelectedFile(null)
        setImageFile(null)
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInitialFilename(event.target.value)
        setFilename(event.target.value.replace(/\s+/g, '').toLowerCase());
    }

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setSelectedFile(event.target.files[0])
        }    
    }

    const handleArtistChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setArtistName(event.target.value)
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            setImageFile(event.target.files[0])
        }    
    }

    return (
        <form>
            <div className="relative max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
                <div className="absolute top-0 right-0 m-2 text-red-700 text-lg font-bold focus:outline-none">
                    <button onClick={onClick}>
                        <IoMdClose size={25}/>
                    </button>   
                </div>
                <input 
                    onChange={handleNameChange} 
                    type="name" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                    id="songname" 
                    aria-describedby="songName" 
                    placeholder="Enter song name"
                />
                <input 
                    onChange={handleArtistChange} 
                    type="name" 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                    id="artistname" 
                    aria-describedby="artistName" 
                    placeholder="Enter artist name"
                />
                <input 
                    onChange={handleFileChange} 
                    type="file" 
                    name="upload" 
                    accept=".mp3" 
                    multiple={false}
                    alt="Upload mp3 track"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                />
                <div className='-mt-4 text-white ml-1'>Upload Song</div>
                <input 
                    onChange={handleImageChange} 
                    type="file" 
                    name="upload" 
                    accept=".jpeg, .png, .jpg"
                    multiple={false} 
                    alt="Upload Image"
                    className=" mt-1 w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                />
                <div className='-mt-4 text-white ml-1'>Upload Image</div>
                <button 
                    disabled={filename==="" || selectedFile===null || isProcessing || imageFile===null || artistName==="" || initialFilename===""} 
                    className={(!(filename!=="" && selectedFile!==null && imageFile!==null) || isProcessing)? "w-full bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-not-allowed": "w-full bg-red-700 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                    onClick={handleFileUpload}
                >
                    {isProcessing ? <FadeLoader color='#ffffff' radius={1}/> : "Upload Song"}
                </button>
            </div>
            
        </form>
    )
}