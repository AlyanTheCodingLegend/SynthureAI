import { useEffect, useState } from "react"
import supabase from "../components/ClientInstance"

type useSongReturn = {
    data: Array<Song> | null
    error: Error | null
}

function useSongs(username: string) : useSongReturn {
    const [data, setData] = useState<Array<Song> | null>(null)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        async function loadSongs() {
            try {
                const {data: dataP, error} = await supabase.from('song_information').select('*').eq('uploaded_by', username)
                if (error) throw error

                setData(dataP)
            } catch (errorP: unknown) {
                if (errorP instanceof Error) {
                    setError(errorP)
                }    
            }
        }
        
        loadSongs()
    }, [username])    

    return {data, error}
}

export default useSongs