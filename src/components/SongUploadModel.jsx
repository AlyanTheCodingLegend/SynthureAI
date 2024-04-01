"use client"

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY)

export default function SongUploadModel () {
    const [selectedFile, setSelectedFile] = useState(null)
    const [filename, setFilename] = useState("")
    const [initialFilename, setInitialFilename] = useState("")
    const [suparesp, setSuparesp] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)


    const handleFileUpload = async (event) => {
        event.preventDefault()

        if (!selectedFile) {
            console.log("No file selected!");
            return;
        }
        
        setIsProcessing(true)

        console.log(selectedFile.name);

        setFilename("")

        try {
            setSuparesp(await supabase
                .storage
                .from("songs")
                .upload(`${filename}.mp3`, selectedFile, {cacheControl: '3600', upsert: true, contentType: 'audio/mpeg'})
            )

            console.log("File uploaded successfully:", suparesp);

            const { errortwo } = await supabase.from('song_information').insert({song_name: initialFilename, song_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/songs/${filename}.mp3`})
            
            if (errortwo) {
                console.error("Error adding song row to the table:", errortwo.message)
            }

        } catch (error) {
            console.error("Error uploading file:", error.message);
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
            <div className="form-group mx-5">
                <input onChange={handleNameChange} type="name" className="form-control" id="songname" aria-describedby="songName" placeholder="Enter song name"/>
                <input onChange={handleFileChange} type="file" name="upload" accept=".mp3" multiple={false}/>
                <button disabled={filename==="" || selectedFile===null || isProcessing} className={(!(filename!=="" && selectedFile!==null) || isProcessing)? "rounded-full h-20 w-40 text-xl text-white bg-slate-600": "bg-red-700 rounded-full h-20 w-40 text-xl text-white hover:bg-red-500"} onClick={handleFileUpload}>{isProcessing ? "Uploading..." : "Upload Song"}</button>
            </div>
        </form>
    )
}