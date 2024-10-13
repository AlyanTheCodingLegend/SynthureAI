"use client";

import React, { useState } from 'react';
import { toast } from "react-toastify";
import toast_style from './ToastStyle';
import { IoMdClose } from "react-icons/io";
import { FadeLoader } from 'react-spinners';
import { handleArtistRowUpdate, handleFileUploadServer } from '../_actions/_actions';

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

    const handleFileUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        if (!selectedFile || !imageFile) {
            toast.error("Please select both audio and image files!", toast_style);
            return;
        }

        setIsProcessing(true)

        try {
            const { data, error } = await handleFileUploadServer(selectedFile, imageFile, artistName, username, filename, initialFilename);
            if (error) throw error;

            if (data!==null) await handleArtistRowUpdate(data, artistName);

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