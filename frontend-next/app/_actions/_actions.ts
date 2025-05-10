"use server";

import { toast } from "react-toastify"
import supabase from "../_components/ClientInstance"
import toast_style from "../_components/ToastStyle"

const supabaseUrl = process.env.SUPABASE_URL

export const createPlaylist = async (username: string, formData: FormData) => {
    const playlistname = formData.get('playlist_name') as string
    const file = formData.get('cover_image') as File

    const {data: fileData, error: fileError} = await supabase.storage.from('images').upload(`${username}/playlist_covers/${playlistname}.${file.type.replace('image/', '')}`, file, {
        cacheControl: '60',
        upsert: true
    })

    if (fileError) {
        toast.error(fileError.message, toast_style)
        return null
    }

    const {data, error} = await supabase.from('playlist_information').insert({created_by: username, playlist_name: playlistname, cover_url: `${supabaseUrl}/storage/v1/object/public/images/${username}/playlist_covers/${playlistname}.${file.type.replace('image/', '')}`}).select("*")
    if (error) {
        toast.error(error.message, toast_style)
        return null
    }

    return data
}

export const signOutServer = async (): Promise<boolean> => {
    const {error} = await supabase.auth.signOut()
    if (error) {
        toast.error(error.message, toast_style)
        return false
    } else {
        return true
    }
}

export const handleArtistRowUpdate = async (songID: number, artistName: string) => {
    try {
        const { data, error } = await supabase.from('artist_information').select('artist_id').eq('name', artistName)
        if (error) throw error;

        if (data.length === 0) {
            const { data: dataOne, error: errorOne } = await supabase.from('artist_information').insert({ name: artistName }).select()
            if (errorOne) throw errorOne;

            const { error: errorTwo } = await supabase.from('artistsong_information').insert({artist_id: dataOne[0].artist_id, song_id: songID})
            if (errorTwo) throw errorTwo;
        } else {
            const { error: errorThree } = await supabase.from('artistsong_information').insert({artist_id: data[0].artist_id, song_id: songID})
            if (errorThree) throw errorThree;
        }
    } catch (error: unknown) {
        if  (error instanceof Error) {
            toast.error(error.message, toast_style);
        }    
    }
}