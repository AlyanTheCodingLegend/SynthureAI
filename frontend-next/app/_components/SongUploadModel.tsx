"use client";

import React, { useState, type JSX } from 'react';
import { toast } from "react-toastify";
import toast_style from './ToastStyle';
import { IoMdClose } from "react-icons/io";
import { FadeLoader } from 'react-spinners';
import { handleArtistRowUpdate } from '../_actions/_actions';
import { useRouter } from 'next/navigation';

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

    const router = useRouter();

    const handleFileUpload = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()

        if (!selectedFile || !imageFile) {
            toast.error("Please select both audio and image files!", toast_style);
            return;
        }

        setIsProcessing(true)

        try {
            const formData = new FormData();
            formData.append("songfile", selectedFile);
            formData.append("imagefile", imageFile);
            formData.append("artistname", artistName);
            formData.append("filename", filename);
            formData.append("initialfilename", initialFilename);

            const response = await fetch(`/api/uploadSong/${username}`, {
                method: 'POST',
                body: formData,
            });

            const { data, error } = await response.json();

            if (error) throw error;

            if (data!==null) await handleArtistRowUpdate(data, artistName);

            toast.success("Song has been uploaded successfully!", toast_style)
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message, toast_style);
            }    
        } finally {
            setIsProcessing(false);
            resetForm();
            onClick();
            router.refresh();
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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
            <form className="w-full max-w-md mx-auto">
                <div className="relative w-full bg-[#1e1e1e] border-2 border-[#6a3aff] rounded-lg shadow-2xl p-6">
                    <h2 className="text-white text-xl font-bold mb-4 text-center">Upload Song</h2>
                    <div className="absolute top-2 right-2">
                        <button 
                            onClick={onClick} 
                            type="button"
                            className="text-white bg-red-500 rounded-full w-6 h-6 flex items-center justify-center transition-colors hover:bg-red-600 focus:outline-none"
                        >
                            <IoMdClose size={18}/>
                        </button>   
                    </div>
                    <input 
                        onChange={handleNameChange} 
                        type="text" 
                        className="w-full bg-[#262626] border border-[#444] rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-[#7c4dff] transition-all hover:border-gray-400" 
                        id="songname" 
                        aria-describedby="songName" 
                        placeholder="Enter song name"
                        value={initialFilename}
                    />
                    <input 
                        onChange={handleArtistChange} 
                        type="text" 
                        className="w-full bg-[#262626] border border-[#444] rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-[#7c4dff] transition-all hover:border-gray-400" 
                        id="artistname" 
                        aria-describedby="artistName" 
                        placeholder="Enter artist name"
                        value={artistName}
                    />
                    <div className="mb-4">
                        <div className="bg-[#262626] border border-[#444] rounded-lg px-3 py-2 text-white transition-all hover:border-gray-400">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Upload Song</label>
                            <div className="flex items-center">
                                <button 
                                    type="button" 
                                    className="bg-[#444] hover:bg-[#555] transition-colors text-white rounded px-3 py-1 mr-3"
                                    onClick={() => document.getElementById('audioFileInput')?.click()}
                                >
                                    Choose File
                                </button>
                                <span className="text-gray-300 text-sm truncate flex-1">
                                    {selectedFile ? selectedFile.name : 'No file chosen'}
                                </span>
                            </div>
                            <input 
                                id="audioFileInput"
                                onChange={handleFileChange} 
                                type="file" 
                                name="upload" 
                                accept=".mp3" 
                                multiple={false}
                                alt="Upload mp3 track"
                                className="hidden"
                            />
                        </div>
                    </div>
                    
                    <div className="mb-5">
                        <div className="bg-[#262626] border border-[#444] rounded-lg px-3 py-2 text-white transition-all hover:border-gray-400">
                            <label className="block text-sm font-medium text-gray-300 mb-1">Upload Image</label>
                            <div className="flex items-center">
                                <button 
                                    type="button" 
                                    className="bg-[#444] hover:bg-[#555] transition-colors text-white rounded px-3 py-1 mr-3"
                                    onClick={() => document.getElementById('imageFileInput')?.click()}
                                >
                                    Choose File
                                </button>
                                <span className="text-gray-300 text-sm truncate flex-1">
                                    {imageFile ? imageFile.name : 'No file chosen'}
                                </span>
                            </div>
                            <input 
                                id="imageFileInput"
                                onChange={handleImageChange} 
                                type="file" 
                                name="upload" 
                                accept=".jpeg, .png, .jpg"
                                multiple={false} 
                                alt="Upload Image"
                                className="hidden"
                            />
                        </div>
                    </div>
                    
                    <button 
                        disabled={filename==="" || selectedFile===null || isProcessing || imageFile===null || artistName==="" || initialFilename===""} 
                        className={(!(filename!=="" && selectedFile!==null && imageFile!==null && artistName!=="" && initialFilename!=="") || isProcessing)? 
                            "w-full bg-[#a18cd1] bg-opacity-40 text-white font-bold py-3 px-4 rounded-lg focus:outline-none cursor-not-allowed" : 
                            "w-full bg-[#7c4dff] hover:bg-[#6a3aff] transition-colors text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"}
                        onClick={handleFileUpload}
                        type="button"
                    >
                        {isProcessing ? <div className="flex justify-center"><FadeLoader color='#ffffff' radius={1} height={10} width={3} margin={2}/></div> : "Upload Song"}
                    </button>
                </div>
            </form>
        </div>
    )
}