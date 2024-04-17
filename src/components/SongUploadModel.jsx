"use client"

import supabase from './ClientInstance';
import { useState } from 'react';
import { ToastContainer, toast} from "react-toastify";
import toast_style from './ToastStyle';

export default function SongUploadModel ({username, userAuth, sessionAuth}) {
    const [selectedFile, setSelectedFile] = useState(null)
    const [filename, setFilename] = useState("")
    const [initialFilename, setInitialFilename] = useState("")
    // eslint-disable-next-line
    const [suparesp, setSuparesp] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)

    console.log(username)
    console.log(userAuth)
    console.log(sessionAuth.access_token)

    const handleFileUpload = async (event) => {
        event.preventDefault()

        if (!selectedFile) {
            toast.error("No file selected!", toast_style);
            return;
        }
        
        setIsProcessing(true)
        setFilename("")

        try {
            setSuparesp(await supabase
                .storage
                .from("songs")
                .upload(`${username}/${filename}.mp3`, selectedFile, {cacheControl: '3600', upsert: true, contentType: 'audio/mpeg'})
            )

            toast.success("File uploaded successfully", toast_style);

            const { errortwo } = await supabase.from('song_information').insert({song_name: initialFilename, song_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/songs/${username}/${filename}.mp3`, uploaded_by: username})
            
            if (errortwo) {
                toast.error(errortwo.message, toast_style)
            }

        } catch (error) {
            toast.error(error.message, toast_style);
        } finally {
            setFilename("")
            setInitialFilename("")
            setSelectedFile(null)
            setIsProcessing(false)
        }
    };

    const handleNameChange = (event) => {
        setInitialFilename(event.target.value)
        setFilename(event.target.value.replace(/\s+/g, '').toLowerCase());
    }

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0])
    }

    return (
        <form>
    <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
        <input 
            onChange={handleNameChange} 
            type="name" 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
            id="songname" 
            aria-describedby="songName" 
            placeholder="Enter song name"
        />
        <input 
            onChange={handleFileChange} 
            type="file" 
            name="upload" 
            accept=".mp3" 
            multiple={false} 
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
        />
        <button 
            disabled={filename==="" || selectedFile===null || isProcessing} 
            className={(!(filename!=="" && selectedFile!==null) || isProcessing)? "w-full bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-not-allowed": "w-full bg-red-700 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
            onClick={handleFileUpload}
        >
            {isProcessing ? "Uploading..." : "Upload Song"}
        </button>
    </div>
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
</form>

    )
}