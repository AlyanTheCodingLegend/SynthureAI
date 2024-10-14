import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

type ContextType = {
    params: {
        username: string
    }
}

export async function GET(request: Request, context: ContextType) {
    const username = context.params.username

    const response = await supabase.from('song_information').select('*').eq('uploaded_by', username)
    return NextResponse.json(response)
}