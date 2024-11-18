import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

type ContextType = {
    params: Promise<{
        playlistid: string
    }>
}

export async function POST(request: Request, context: ContextType) {
    const playlistid = (await context.params).playlistid
    const { array } = await request.json()

    const songIDs = JSON.parse(array)

    let filteredSongs=[]
    let playlistsongIDs=[]

    try {
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

        return NextResponse.json({data: songsData, error: null})
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({data: null, error})
        }
    }    
}