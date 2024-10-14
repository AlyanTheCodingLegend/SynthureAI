import { useEffect, useState } from "react"
import useSongs from "./useSongs"
import type { Song } from "../_types/types"

type useSongReturn = {
    data: Array<Song> | null
    error: Error | null
}

function useFilteredSongs(username: string, playlistid: string) : useSongReturn {
    const [data, setData] = useState<Array<Song> | null>(null)
    const [error, setError] = useState<Error | null>(null)

    const {data: dataP, error: errorP} = useSongs(username)
    
    useEffect(() => {
        async function loadFilteredSongs() {
            try {
                let songIDs=[]
                
                if (errorP) throw errorP

                if (dataP) {
                    for (let i=0;i<dataP.length;i++) {
                        songIDs.push(dataP[i].id)
                    }
                }    

                const response = await fetch(`/api/getFilteredSongs/${playlistid}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({array: JSON.stringify(songIDs)})
                })

                const {data: songsData, error} = await response.json()
                if (error) throw error

                setData(songsData)

            } catch (errorP: unknown) {
                if (errorP instanceof Error) {
                    setError(errorP)
                }    
            }
        }
        
        if (dataP || errorP) {
            loadFilteredSongs()
        }    
    }, [dataP, errorP])

    return {data, error}
}

export default useFilteredSongs