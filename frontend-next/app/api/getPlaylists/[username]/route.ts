import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

type ContextType = {
    params: {
        username: string
    }
}

export async function GET(request: Request, context: ContextType) {
    const username = context.params.username

    const response = await supabase.from('playlist_information').select('playlist_id, playlist_name').eq('created_by', username)
    return NextResponse.json(response)
}