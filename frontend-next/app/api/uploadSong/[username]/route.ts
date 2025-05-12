import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

type ContextType = {
    params: Promise<{
        username: string
    }>
}

const supabaseUrl = process.env.SUPABASE_URL

export async function POST(request: Request, context: ContextType) {
    const username = (await context.params).username

    const formData = await request.formData()

    const selectedFile = formData.get('songfile') as File
    const imageFile = formData.get('imagefile') as File
    const artistName = formData.get('artistname') as string
    const filename = formData.get('filename') as string
    const initialFilename = formData.get('initialfilename') as string

    try {
        const { error } = await supabase.storage.from("songs").upload(`${username}/${filename}.mp3`, selectedFile, { cacheControl: '60', upsert: true, contentType: 'audio/mpeg' })
        if (error) throw error;

        const { error: errorOne } = await supabase.storage.from("images").upload(`${username}/${filename}.${imageFile.type.replace('image/', '')}`, imageFile, { cacheControl: '60', upsert: true, contentType: imageFile.type })
        if (errorOne) throw errorOne;

        const { error: errorThree } = await supabase.from('image_information').insert({ uploaded_by: username, size: `${imageFile.size / (1024 * 1024)}`, format: `${imageFile.type}`, image_path: `${supabaseUrl}/storage/v1/object/public/images/${username}/${filename}.${imageFile.type.replace('image/','')}` })
        if (errorThree) throw errorThree;

        const { data, error: errorTwo } = await supabase.from('song_information').insert({ song_name: initialFilename, song_path: `${supabaseUrl}/storage/v1/object/public/songs/${username}/${filename}.mp3`, uploaded_by: username, artist_name: artistName, image_path: `${supabaseUrl}/storage/v1/object/public/images/${username}/${filename}.${imageFile.type.replace('image/','')}` }).select()
        if (errorTwo) throw errorTwo;

        return NextResponse.json({ data: data[0].id, error: null })
    } catch (error: unknown) {
        return NextResponse.json({ data: null, error })
    } 
}