"use client";

import { useEffect, useState, type JSX } from "react";
import { toast } from "react-toastify";
import toast_style from "@/app/_components/ToastStyle";
import { IoMdArrowBack } from "react-icons/io";
import { FaRegCirclePlay, FaRegCirclePause } from "react-icons/fa6";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FaPlus } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { useParams, useRouter } from "next/navigation";
import { BeatLoader } from "react-spinners";
import "@/app/_styles/NoScrollbar.css";
import useSongsFromPlaylist from "@/app/_hooks/useSongsFromPlaylist";
import { AppDispatch, RootState } from "@/app/_states/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setIndex,
  setIsUniversallyPlaying,
  setOpenPlaylist,
  setPlayPlaylistID,
  setSongArray,
} from "@/app/_states/songArraySlice";
import Link from "next/link";
import {
  deletePlaylistServer,
  removeFromPlaylistServer,
} from "./actions";

export default function ShowPlaylistModel(): JSX.Element {
  const [name, setName] = useState<string | null>(null);
  const [songnames, setSongnames] = useState<Array<string> | null>(null);
  const [images, setImages] = useState<Array<string>>([]);
  const [artists, setArtists] = useState<Array<string>>([]);
  const [indexes, setIndexes] = useState<Array<number>>([]);
  const [backupSongs, setBackupSongs] = useState<Array<string>>([]);

  const router = useRouter();

  const isOpen = useSelector((state: RootState) => state.songs.isOpen);
  const playPlaylistID = useSelector((state: RootState) => state.songs.playPlaylistID);
  const isUniversallyPlaying = useSelector((state: RootState) => state.songs.isUniversallyPlaying);
  const index = useSelector((state: RootState) => state.songs.index);

  const params = useParams<{ username: string; playlistid: string }>();
  const username = params.username;
  const playlistid = parseInt(params.playlistid);

  const dispatch = useDispatch<AppDispatch>();

  const { data, error } = useSongsFromPlaylist(playlistid, username);

    useEffect(() => {
        if (error) {
            toast.error(error, toast_style)
        } else if (data) {
            setName(data.name)
            if (data.songnames) {
                setSongnames(data.songnames)
                setImages(data.images)
                setArtists(data.artists)
                setIndexes(data.indexes)
                setBackupSongs(data.backupsongs)
            } else {
                setSongnames([])
                setImages([])
                setArtists([])
                setIndexes([])
            }
        }
    }, [data, error])    
      
    const removeFromPlaylist = async (songindex: number) => {
        if (playlistid === Number(process.env.NEXT_PUBLIC_MYSONGS_ID)) {
            toast.info("Deleting the song from your account", toast_style)
            const response = await fetch("/api/deleteSong", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    songId: indexes[songindex],
                    username: username,
                }),
            })
            if (!response.ok) {
                const error = await response.json()
                toast.error(error.error, toast_style)
                return
            }
            const data = await response.json()
            window.location.reload()
            toast.success(data.message, toast_style)
            return
        }
        let removed = await removeFromPlaylistServer(playlistid, indexes[songindex])
        if (removed) {
            if (songnames) {
                setSongnames(prevSongs => (prevSongs ?? []).filter(s => s !== songnames[songindex]))
                setImages(prevImages => prevImages.filter(s => s !== images[songindex]))
                setArtists(prevArtists => prevArtists.filter(s => s !== artists[songindex]))
                setIndexes(prevIndexes => prevIndexes.filter(s => s !== indexes[songindex]))
            }  
        }
    }

    const deletePlaylist = async () => {
        let deleted = await deletePlaylistServer(playlistid)
        if (deleted) {
            dispatch(setOpenPlaylist(false))
        }
    }

  const handlePlay = (songindex: number) => {
    if (playPlaylistID !== playlistid) {
      dispatch(setPlayPlaylistID(playlistid));
      if (!isUniversallyPlaying) {
        dispatch(setSongArray(backupSongs));
        dispatch(setIsUniversallyPlaying(true));
      }
    }
    dispatch(setIndex(songindex));
  };

  const handleGoBack = () => {
    dispatch(setOpenPlaylist(false));
  };

  const handleAddSongs = () => {
    if (playlistid === Number(process.env.NEXT_PUBLIC_MYSONGS_ID)) {
      toast.warning("This is an automated playlist!", toast_style);
    } else {
      router.push(`/${username}/${playlistid}/addsongs`);
    }
  };

  const handleDeletePlaylist = () => {
    if (playlistid === Number(process.env.NEXT_PUBLIC_MYSONGS_ID)) {
      toast.warning("You can't delete this playlist!", toast_style);
    } else {
      deletePlaylist();
    }
  };

  if (songnames === null) {
    return (
      <div className={`${isOpen ? "ml-[250px]" : "ml-[50px]"} bg-[#0F0F0F] w-screen min-h-screen flex items-center justify-center`}>
        <BeatLoader size={30} color="#9333EA" />
      </div>
    );
  }

  return (
    <div className={`${isOpen ? "ml-[250px]" : "ml-[50px]"} bg-[#0F0F0F] w-screen min-h-screen overflow-x-hidden no-scrollbar p-5`}>
      <div className="max-w-[1000px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[36px] font-bold text-white">{name || "My Songs"}</h1>
          <div className="flex gap-4 bg-[rgba(26,26,26,0.7)] backdrop-blur-md p-2 px-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
            <Link href={`/${username}`}>
              <button className="w-10 h-10 flex items-center justify-center text-white hover:text-[#9333EA]" onClick={handleGoBack}>
                <IoMdArrowBack />
              </button>
            </Link>
            <button className="w-10 h-10 flex items-center justify-center text-white hover:text-[#9333EA]" onClick={handleAddSongs}>
              <FaPlus />
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-white hover:text-[#E53E3E]" onClick={handleDeletePlaylist}>
              <MdDeleteForever />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-[100px]">
          {songnames.length > 0 ? (
            songnames.map((songname, i) => (
              <div key={i} className="flex items-center justify-between bg-[#1A1A1A] rounded-xl overflow-hidden border border-[#2A2A2A] hover:bg-[#222222] hover:border-[rgba(147,51,234,0.3)] hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                <div className="w-[100px] h-[100px] bg-[#2A2A2A] flex-shrink-0">
                  <img src={images[i]} alt={songname} className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 px-5 overflow-hidden">
                  <h3 className="text-[20px] font-semibold text-white truncate">{songname}</h3>
                  <p className="text-[14px] text-[#A0AEC0] truncate">By: {artists[i]}</p>
                </div>

                <div className="flex gap-4 pr-5 items-center flex-shrink-0">
                  {(index === i && playPlaylistID === playlistid) && (
                    <div className="hidden md:flex items-end gap-[3px] opacity-100">
                      {[30, 60, 45, 80, 40].map((h, j) => (
                        <div key={j} className={`w-[3px] bg-[#9333EA] rounded-[1px] h-[${h}%] animate-[wave_0.5s_infinite_alternate]`} />
                      ))}
                    </div>
                  )}
                  <button onClick={() => handlePlay(i)} className={`w-[54px] h-[54px] flex items-center justify-center rounded-full text-[20px] text-white ${index === i && playPlaylistID === playlistid ? 'bg-[#7e22ce]' : 'bg-[#9333EA]'} hover:scale-[1.05] transition-all`}>
                    {(index === i && playPlaylistID === playlistid) ? <FaRegCirclePause /> : <FaRegCirclePlay />}
                  </button>
                  <button onClick={() => removeFromPlaylist(i)} className="w-[54px] h-[54px] flex items-center justify-center rounded-full bg-[rgba(26,26,26,0.7)] text-white border border-[rgba(255,255,255,0.05)] hover:text-[#E53E3E] hover:border-[rgba(229,62,62,0.3)]">
                    <RiDeleteBin6Line />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-white text-lg">
              No songs in this playlist! Add some to start the vibe 😎
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
