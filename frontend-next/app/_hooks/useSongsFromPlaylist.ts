import { useEffect, useState } from "react"
import supabase from "../_components/ClientInstance"

type useSongsFromPlaylistReturn = {
    data: SongInformation | null,
    error: string | null
}

type SongInformation = {
    name: string | null,
    backupsongs: Array<string>,
    indexes: Array<number>,
    songnames: Array<string>,
    images: Array<string>,
    artists: Array<string>
}        

function useSongsFromPlaylist(playlist_id: number, username: string): useSongsFromPlaylistReturn {
    const [data, setData] = useState<SongInformation | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadSongsFromPlaylist(playlistID: number, username: string) {
            if (playlistID!==Number(process.env.NEXT_PUBLIC_MYSONGS_ID)) {
                
                try {    
                    let songArray=[]
                    let songNameArray=[]
                    let imageArray=[]
                    let indexArray=[]
                    let artistArray=[]
                    let songDataArray=[]

                    const {data: playlistData, error: playlistError} = await supabase.from('playlist_information').select('playlist_name').eq('playlist_id', playlistID)

                    if (playlistError) throw playlistError

                    const {data: dataP, error: errorP2} = await supabase.from('playlistsong_information').select('song_id').eq('playlist_id', playlistID)
                    
                    if (errorP2) throw errorP2
                   
                    if (dataP.length!==0) {
                        
                        for (let i=0;i<dataP.length;i++) {
                            songDataArray.push(dataP[i].song_id)
                        }
                        const {data: songData, error: songError} = await supabase.from('song_information').select('*').in('id', songDataArray)
                        if (songError) throw songError
                        for (let j=0;j<songData.length;j++) {
                            songArray.push(songData[j].song_path)
                            songNameArray.push(songData[j].song_name)
                            imageArray.push(songData[j].image_path)
                            indexArray.push(songData[j].id)
                            artistArray.push(songData[j].artist_name)
                        }
                        
                        setData({
                            name: playlistData[0].playlist_name,
                            backupsongs: songArray,
                            indexes: indexArray,
                            songnames: songNameArray,
                            images: imageArray,
                            artists: artistArray
                        })
                        
                    }
                } catch (errorP: unknown) {
                    
                    if (errorP instanceof Error) {
                        setError(errorP.message)
                        setData(null)
                    }    
                }
            } else {
                try {
                    let songArray=[]
                    let songNameArray=[]
                    let imageArray=[]
                    let indexArray=[]
                    let artistArray=[]
                    const {data: dataP, error: errorP2} = await supabase.from('song_information').select('*').eq('uploaded_by', username)
                    if (errorP2) throw errorP2
                    for (let j=0;j<dataP.length;j++) {
                        songArray.push(dataP[j].song_path)
                        songNameArray.push(dataP[j].song_name)
                        imageArray.push(dataP[j].image_path)
                        indexArray.push(dataP[j].id)
                        artistArray.push(dataP[j].artist_name)
                    }
                    setData({
                        name: "My Songs",
                        backupsongs: songArray,
                        indexes: indexArray,
                        songnames: songNameArray,
                        images: imageArray,
                        artists: artistArray
                    })
                } catch (errorP: unknown) {
                    if (errorP instanceof Error) {
                        setError(errorP.message)
                        setData(null)
                    }
                }    
            }   
        }

        loadSongsFromPlaylist(playlist_id, username)
    // eslint-disable-next-line
    }, [])

    return {data, error}
}

export default useSongsFromPlaylist