"use server";

import supabase from "@/app/_components/ClientInstance"

export const removeFromPlaylistServer = async (playlistid: number, song_id: number): Promise<boolean> => {
    
    const {error} = await supabase.from("playlistsong_information").delete().eq('playlist_id', playlistid).eq('song_id', song_id)
    if (error) {
        return false
    } else {
        return true
    }
}

export const deletePlaylistServer = async (playlistid: number): Promise<boolean> => {
    const {error} = await supabase.from("playlist_information").delete().eq('playlist_id', playlistid)
    if (error) {
        return false
    } else {
        return true
    }
}