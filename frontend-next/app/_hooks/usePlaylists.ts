import { useEffect, useState } from "react"
import type { Playlist } from "../_types/types"

type usePlaylistsReturn = {
    data : Array<Playlist> | null,
    error: string | null
}

function usePlaylists(username: string): usePlaylistsReturn {
    const [data, setData] = useState<Array<Playlist> | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadPlaylists() {
            const response = await fetch(`/api/getPlaylists/${username}`)
            const {data: dataP, error: errorP} = await response.json()
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