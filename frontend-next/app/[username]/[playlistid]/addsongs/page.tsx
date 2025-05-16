"use client";

import { toast } from "react-toastify";
import { useEffect, useState, type JSX } from "react";
import toast_style from "@/app/_components/ToastStyle";
import { BeatLoader } from "react-spinners";
import { IoMdClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import "@/app/_styles/NoScrollbar.css";
import useFilteredSongs from "@/app/_hooks/useFilteredSongs";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Song } from "@/app/_types/types";
import { addToPlaylist } from "./actions";

export default function AddSongModel(): JSX.Element {
    const [songs, setSongs] = useState<Array<Song> | null>(null);

    const paramData = useParams<{ username: string; playlistid: string }>();
    const username = paramData.username || "";
    const playlistid = paramData.playlistid || "";

    const { data: songData, error: songError } = useFilteredSongs(username, playlistid);

    useEffect(() => {
        if (songError) {
            toast.error(songError.message, toast_style);
        } else if (songData) {
            setSongs(songData);
        }
    }, [songData, songError]);

    const handleClick = async (song: Song) => {
        const added = await addToPlaylist(parseInt(playlistid), song.id);
        if (added) {
            setSongs((prev) => (prev ?? []).filter((s) => s.id !== song.id));
        }
    };

    if (!songs) {
        return (
            <div className="flex w-screen h-screen justify-center items-center bg-gradient-to-b from-black to-[#1a1a1a]">
                <BeatLoader size={30} color="purple" />
            </div>
        );
    }

    return (
        <div className="min-h-screen w-screen px-4 py-8 bg-gradient-to-b from-black to-[#1a1a1a] text-white no-scrollbar">
            <div className="absolute top-4 right-4 z-50">
                <Link href={`/${username}`}>
                    <IoMdClose size={36} className="text-red-500 hover:text-red-400 transition duration-200" />
                </Link>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">Add your uploaded songs to this playlist</h1>
            <hr className="border-t border-purple-500 mb-10 w-3/4 mx-auto" />

            {songs.length !== 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {songs.map((song, index) => (
                        <div
                            key={index}
                            className="flex items-center bg-zinc-900 p-4 rounded-lg hover:bg-zinc-800 transition duration-300 border border-zinc-700 shadow-md"
                        >
                            <img
                                src={song.image_path}
                                alt="cover"
                                className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                            />
                            <div className="flex flex-col ml-4 flex-grow overflow-hidden">
                                <h3 className="text-lg font-semibold truncate">{song.song_name}</h3>
                                <p className="text-sm text-gray-400 truncate">By: {song.artist_name}</p>
                            </div>
                            <button
                                onClick={() => handleClick(song)}
                                className="ml-auto text-green-400 hover:text-white transition"
                                title="Add to Playlist"
                            >
                                <FaPlus size={24} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center mt-10 text-lg text-gray-300">
                    No songs to add. Try uploading some to add them to this playlist!
                </div>
            )}
        </div>
    );
}
