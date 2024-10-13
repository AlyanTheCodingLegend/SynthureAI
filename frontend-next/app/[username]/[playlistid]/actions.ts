"use server";

import supabase from "@/app/_components/ClientInstance"
import toast_style from "@/app/_components/ToastStyle"
import { toast } from "react-toastify"

export const removeFromPlaylistServer = async (playlistid: number, song_id: number): Promise<boolean> => {
    
    const {error} = await supabase.from("playlistsong_information").delete().eq('playlist_id', playlistid).eq('song_id', song_id)
    if (error) {
        toast.error(error.message, toast_style)
        return false
    } else {
        toast.success('Song removed from playlist!')
        return true
    }
}

export const deletePlaylistServer = async (playlistid: number): Promise<boolean> => {
    const {error} = await supabase.from("playlist_information").delete().eq('playlist_id', playlistid)
    if (error) {
        toast.error(error.message, toast_style)
        return false
    } else {
        toast.success('Playlist deleted successfully!', toast_style)
        return true
    }
}