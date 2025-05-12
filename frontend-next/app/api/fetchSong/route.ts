import fs from "fs";
import { createYouTubeSearchURL } from "@/app/_utils/ytUrl";
import { NextRequest, NextResponse } from "next/server";
import supabase from "@/app/_components/ClientInstance";

const supabaseUrl= process.env.SUPABASE_URL || '';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const string = searchParams.get("string");
    const username = searchParams.get("username");
    
    if (!string) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }
    if (!username) {
        return NextResponse.json({ error: "No username provided" }, { status: 400 });
    }

    const ytString = createYouTubeSearchURL(string);

    console.log(ytString)

    const response = await fetch(`http://localhost:5000/search?url=${ytString}`)
    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch data from YouTube" }, { status: 500 });
    }
    
    const data = await response.json()

    if (data.error) {
        return NextResponse.json({ error: data.error }, { status: 500 });
    }

    const { path, thumbnail_url, file_name, song_name } = data;
    if (!path || !thumbnail_url || !file_name || !song_name) {
        return NextResponse.json({ error: "Invalid response from server" }, { status: 500 });
    }

    if (!fs.existsSync(path)) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(path);

    const { error: insertError } = await supabase.storage.from("songs").upload(`/${username}/${file_name}`, fileBuffer, {contentType: "audio/mpeg", upsert: true});
    if (insertError) {
        return NextResponse.json({ error: "Failed to upload file to Supabase" }, { status: 500 });
    }

    const { data: recordData, error: recordError } = await supabase.from("song_information").insert({ artist_name: "YT", image_path: thumbnail_url, song_name: song_name, song_path: `${supabaseUrl}/storage/v1/object/public/songs/${username}/${file_name}`, uploaded_by: username, is_AI_gen: false, is_YT_fetched: true }).select();
    if (recordError) {
        return NextResponse.json({ error: "Failed to insert record into Supabase" }, { status: 500 });
    }

    try {
        fs.unlinkSync(path);
        console.log(`Removed temporary file: ${path}`);
    } catch (cleanupError) {
        console.warn(`Could not remove temporary file: ${path}`, cleanupError);
    }

    return NextResponse.json({ message: "File uploaded successfully", song: recordData }, { status: 200 });
}