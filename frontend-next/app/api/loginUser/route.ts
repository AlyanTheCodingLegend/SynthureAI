import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const loginData = await request.json()

    const { data, error } = await supabase.auth.signInWithPassword(loginData)
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (data.user) {
        if (data.user.email_confirmed_at) {
            const { data: usernameData, error } = await supabase.from("user_information").select("username").eq("userid", data.user.id).single()
            if (error) {
                return NextResponse.json({ error: error.message }, { status: 401 })
            }
            return NextResponse.json({ user: data.user, session: data.session, username: usernameData.username }, { status: 200 })
        } else {
            return NextResponse.json({ error: "Please verify your account via email first!" }, { status: 401 })
        }
    }
    return NextResponse.json({ error: "An error occurred, please try again later!" }, { status: 401 })
}