"use server";

import supabase from "@/app/_components/ClientInstance"

export const addToPlaylist = async (playlistid: number, songid: number): Promise<boolean> => {
    const { error } =  await supabase.from('playlistsong_information').insert({playlist_id: playlistid, song_id: songid})
    
    if (error) {
        return false
    } else {
        console.log("Song added successfully!")
        return true
    }    
}