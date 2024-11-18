import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

type ContextType = {
    params: Promise<{
        email: string
    }>
}

export async function GET(request: Request, context: ContextType) {
    const email = (await context.params).email

    const response = await supabase.from('user_information').select('username').eq('email',email)
    return NextResponse.json(response)
}