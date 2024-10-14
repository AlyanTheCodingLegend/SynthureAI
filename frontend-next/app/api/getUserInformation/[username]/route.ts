import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

type ContextType = {
    params: {
        username: string
    }
}

export async function GET(request: Request, context: ContextType) {
    const username = context.params.username

    const response = await supabase.from('user_information').select('*').eq('username', username)
    return NextResponse.json(response)
}