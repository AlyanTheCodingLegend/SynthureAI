import supabase from "@/app/_components/ClientInstance";
import { stripFilenameFromImageUrl, stripFilenameFromSongUrl } from "@/app/_utils/stripFilenameFromUrl";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
    const { songId, username } = await request.json();

    if (!songId) {
        return NextResponse.json({ error: "No song ID provided" }, { status: 400 });
    }
    if (!username) {
        return NextResponse.json({ error: "No username provided" }, { status: 400 });
    }

    const { data, error } = await supabase
        .from("song_information")
        .delete()
        .eq("id", songId)
        .eq("uploaded_by", username)
        .select();

    if (error) {
        return NextResponse.json({ error: "Failed to delete song" }, { status: 500 });
    }

    if (data.length === 0) {
        return NextResponse.json({ error: "No song found with the provided ID" }, { status: 404 });
    }

    const songPath = data[0].song_path;
    const imagePath = data[0].image_path;

    const strippedSongPath = stripFilenameFromSongUrl(songPath)
    if (strippedSongPath) {
        const { error: deleteSongError } = await supabase.storage.from("songs").remove([strippedSongPath]);
        if (deleteSongError) {
            return NextResponse.json({ error: "Failed to delete song from storage" }, { status: 500 });
        }
    }

    const strippedImagePath = stripFilenameFromImageUrl(imagePath)
    if (strippedImagePath) {
        const { error: deleteImageError } = await supabase.storage.from("songs").remove([strippedImagePath]);
        if (deleteImageError) {
            return NextResponse.json({ error: "Failed to delete image from storage" }, { status: 500 });
        }
    }

    return NextResponse.json({ message: "Song deleted successfully" }, { status: 200 });
} 