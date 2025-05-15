import supabase from "@/app/_components/ClientInstance";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const { email, password, username, confpass } = await request.json()

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 401 })
    }
    if (data.user) {
        const hashedPassword = await bcrypt.hash(password, 10)
        const { error: insertError } = await supabase.from("user_information").insert({
            userid: data.user.id,
            username: username,
            hashpass: hashedPassword,
            email: email,
        })
        if (insertError) {
            return NextResponse.json({ error: insertError.message }, { status: 401 })
        }
        return NextResponse.json({ message: true }, { status: 200 })
    }
    return NextResponse.json({ error: "An error occurred, please try again later!" }, { status: 401 })
}