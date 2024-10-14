import { useEffect, useState } from "react"

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
                    const response = await fetch(`/api/getSongsFromPlaylist/${playlistID}`)
                    const {data: dataP, error: errorP} = await response.json()
                    if (errorP) throw errorP

                    setData(dataP)
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
                    const response = await fetch(`/api/getSongs/${username}`)
                    const {data: dataP, error: errorP2} = await response.json()
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