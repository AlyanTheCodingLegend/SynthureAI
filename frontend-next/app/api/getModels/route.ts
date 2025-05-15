import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.SONG_FETCH_API_URL || '';

export async function GET(request: NextRequest) {
    const response = await fetch(`${backendUrl}/models`)

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 });
    }
    
    const data = await response.json()
    if (data.error) {
        return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json(data.models)
}