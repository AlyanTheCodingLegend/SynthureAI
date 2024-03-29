"use client"

import { createClient } from '@supabase/supabase-js';
import { useState } from 'react';

const supabase = createClient("https://uddenmrxulkqkllfwxlp.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkZGVubXJ4dWxrcWtsbGZ3eGxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwOTc1NjI1MSwiZXhwIjoyMDI1MzMyMjUxfQ.npWelLJdthzXFsWbAiXnY0ZBjQ5OyZe8NrXtWyXquZw")

export default function SongUploadModel () {
    const [selectedFile, setSelectedFile] = useState(new File([""],""))
    const [filename, setFilename] = useState("")
    const [initialFilename, setInitialFilename] = useState("")

    const handleFileUpload = async (event) => {
        event.preventDefault()

        if (!selectedFile) {
            console.log("No file selected!");
            return;
        }
    
        console.log(selectedFile.name);

        try {
            const { data } = await supabase
                .storage
                .from("songs")
                .upload(`${filename}.mp3`, selectedFile, {cacheControl: '3600', upsert: true, contentType: 'audio/mpeg'});
    
            console.log("File uploaded successfully:", data);

            const { errortwo } = await supabase.from('song_information').insert({song_name: initialFilename, song_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/songs/${filename}.mp3`})
            
            if (errortwo) {
                console.error("Error adding song row to the table:", errortwo.message)
            }

        } catch (error) {
            console.error("Error uploading file:", error.message);
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
                <button className="bg-red-700 rounded-full h-20 w-40 text-xl text-white hover:bg-red-500" onClick={handleFileUpload}>Upload Song</button>
            </div>
        </form>
    )
}