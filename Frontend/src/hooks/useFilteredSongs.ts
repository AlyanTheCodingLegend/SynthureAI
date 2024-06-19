import { useEffect, useState } from "react"
import supabase from "../components/ClientInstance"
import useSongs from "./useSongs"

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
                let filteredSongs=[]
                let playlistsongIDs=[]
                
                if (errorP) throw errorP

                if (dataP) {
                    for (let i=0;i<dataP.length;i++) {
                        songIDs.push(dataP[i].id)
                    }
                }    

                const {data: playlistSongs, error: playlistError} = await supabase.from('playlistsong_information').select('song_id').eq('playlist_id', playlistid).in('song_id', songIDs)
                if (playlistError) throw playlistError

                for (let i=0;i<playlistSongs.length;i++) {
                    playlistsongIDs.push(playlistSongs[i].song_id)
                }

                for (let i=0;i<songIDs.length;i++) {
                    if (!playlistsongIDs.includes(songIDs[i])) {
                        filteredSongs.push(songIDs[i])
                    }
                }        

                const {data: songsData, error: songsError} = await supabase.from('song_information').select('*').in('id', filteredSongs)
                if (songsError) throw songsError

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