"use server";

import { toast } from "react-toastify"
import supabase from "../_components/ClientInstance"
import toast_style from "../_components/ToastStyle"

type handleFileUploadServerReturn = {
    data: number | null,
    error: unknown | null
}

export const createPlaylist = async (username: string, playlistname: string) => {
    const {data, error} = await supabase.from('playlist_information').insert({created_by: username, playlist_name: playlistname}).select("*")
    if (error) {
        toast.error(error.message, toast_style)
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

export const handleFileUploadServer = async (selectedFile: File, imageFile: File, artistName: string, username: string, filename: string, initialFilename: string): Promise<handleFileUploadServerReturn> => {
    try {
        const { error } = await supabase.storage.from("songs").upload(`${username}/${filename}.mp3`, selectedFile, { cacheControl: '3600', upsert: true, contentType: 'audio/mpeg' })
        if (error) throw error;

        const { error: errorOne } = await supabase.storage.from("images").upload(`${username}/${filename}.${imageFile.type.replace('image/', '')}`, imageFile, { cacheControl: '3600', upsert: true, contentType: imageFile.type })
        if (errorOne) throw errorOne;

        const { error: errorThree } = await supabase.from('image_information').insert({ uploaded_by: username, size: `${imageFile.size / (1024 * 1024)}`, format: `${imageFile.type}`, image_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/${username}/${filename}.${imageFile.type.replace('image/','')}` })
        if (errorThree) throw errorThree;

        const { data, error: errorTwo } = await supabase.from('song_information').insert({ song_name: initialFilename, song_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/songs/${username}/${filename}.mp3`, uploaded_by: username, artist_name: artistName, image_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/${username}/${filename}.${imageFile.type.replace('image/','')}` }).select()
        if (errorTwo) throw errorTwo;

        return { data: data[0].id, error: null }
    } catch (error: unknown) {
        return { data: null, error } 
    }    
}
            