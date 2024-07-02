import { useEffect, useState } from "react"
import supabase from "../_components/ClientInstance"

type usePlaylistsReturn = {
    data : Array<Playlist> | null,
    error: string | null
}

function usePlaylists(username: string): usePlaylistsReturn {
    const [data, setData] = useState<Array<Playlist> | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPlaylists() {
            const {data: dataP, error: errorP} = await supabase.from('playlist_information').select('playlist_id, playlist_name').eq('created_by', username)
            if (errorP) {
                setError(errorP.message)
            } else {
                setData(dataP)
            }
        }

        loadPlaylists()
    }, [username])
    
    return {data, error}
}

export default usePlaylists