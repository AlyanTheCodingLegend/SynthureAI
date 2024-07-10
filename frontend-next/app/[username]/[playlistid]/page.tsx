"use client"

import { useParams } from "next/navigation"

export default function PlaylistModel() {
    const params = useParams<{playlistid: string}>()
    
    return (
        <div>
            {params.playlistid}
        </div>
    )
}