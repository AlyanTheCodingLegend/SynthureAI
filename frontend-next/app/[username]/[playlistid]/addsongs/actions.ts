"use server";

import supabase from "@/app/_components/ClientInstance"
import toast_style from "@/app/_components/ToastStyle"
import { toast } from "react-toastify"

export const addToPlaylist = async (playlistid: number, songid: number): Promise<boolean> => {
    const { error } =  await supabase.from('playlistsong_information').insert({playlist_id: playlistid, song_id: songid})
    
    if (error) {
        toast.error(error.message, toast_style)
        return false
    } else {
        toast.success("Song added successfully!")
        return true
    }    
}