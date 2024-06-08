import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import supabase from "./ClientInstance"
import { toast } from "react-toastify"
import toast_style from "./ToastStyle"

export default function SearchBar():JSX.Element {
    const [songs, setSongs] = useState<Array<string>>([])
    const [songName, setSongName] = useState<string>("")

    const userData = useParams()
    
    const username = userData.username || ""

    useEffect(() => {
        async function loadSongs() {
            try {
                const {data, error} = await supabase.from('song_information').select('song_name').eq('uploaded_by', username)
                if (error) throw error

                let songArray=[]
                if (data.length===0) throw new Error("No songs found!")

                for (let i=0;i<data.length;i++) {
                    songArray.push(data[i].song_name)
                }

                setSongs(songArray)
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message, toast_style)
                }
            }
        }

        loadSongs()
    }, [username])

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSongName(e.target.value)
    }

    return (
        <div className="ml-4 z-1">
            <input id="songname" onChange={handleSearch} type="text" placeholder="Search for a song" className="bg-black"/>
        </div>
    )
}