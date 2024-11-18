import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

type ContextType = {
    params: Promise<{
        playlistid: string
    }>
}

export async function GET(request: Request, context: ContextType) {
    const playlistid = (await context.params).playlistid

    try {    
        let songArray=[]
        let songNameArray=[]
        let imageArray=[]
        let indexArray=[]
        let artistArray=[]
        let songDataArray=[]


        const {data: playlistData, error: playlistError} = await supabase.from('playlist_information').select('playlist_name').eq('playlist_id', playlistid)

        if (playlistError) throw playlistError

        const {data: dataP, error: errorP2} = await supabase.from('playlistsong_information').select('song_id').eq('playlist_id', playlistid)
        
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

            const data = {
                name: playlistData[0].playlist_name,
                backupsongs: songArray,
                indexes: indexArray,
                songnames: songNameArray,
                images: imageArray,
                artists: artistArray
            }

            return NextResponse.json({data, error: null})
        }
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({data: null, error: error})
        }    
    }

    return NextResponse.json({data: null, error: 'No songs found'})
}