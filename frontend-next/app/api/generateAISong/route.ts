import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.SONG_FETCH_API_URL || '';

export async function POST(request: NextRequest) {
    const requestBody = await request.json();
    const { song_url, username, artist } = requestBody;

    if (!song_url) {
        return NextResponse.json({ error: "No song path provided" }, { status: 400 });
    }
    if (!username) {
        return NextResponse.json({ error: "No username provided" }, { status: 400 });
    }
    if (!artist) {
        return NextResponse.json({ error: "No artist name provided" }, { status: 400 });
    }

    const response = await fetch(`${backendUrl}/transform-from-url`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        return NextResponse.json({ error: "Failed to fetch data from server" }, { status: 500 });
    }

    const requestData = await response.json();

    if (!requestData.success) {
        return NextResponse.json({ error: requestData.message }, { status: 500 });
    }

    return NextResponse.json(requestData, { status: 200 });
}