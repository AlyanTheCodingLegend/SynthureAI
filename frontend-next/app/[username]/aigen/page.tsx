"use client";

import { useEffect, useState, type JSX } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import toast_style from "@/app/_components/ToastStyle";
import { IoMdClose } from "react-icons/io";
import { FaPlus } from "react-icons/fa6";
import { BeatLoader } from "react-spinners";
import useSongs from "@/app/_hooks/useSongs";
import useModels from "@/app/_hooks/useModels";
import { useParams } from "next/navigation";
import { Song } from "@/app/_types/types";

export default function AIGeneration(): JSX.Element {
  const [songs, setSongs] = useState<Array<Song>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedModel, setSelectedModel] = useState<string>("");
  
  const paramData = useParams<{username: string}>();
  const username = paramData.username || "";
  
  const { data: songData, error: songError } = useSongs(username);
  const { models: modelData, error: modelError } = useModels();

  useEffect(() => {
    if (songError) {
      toast.error(songError.message, toast_style);
    } else if (songData) {
      setSongs(songData);
    }
    
    if (modelData && modelData.length > 0) {
      setSelectedModel(modelData[0].name);
    }
    
    setIsLoading(false);
  }, [songData, songError, modelData, modelError]);

  const handleClick = async (song_path: string) => {
    if (!selectedModel) {
      toast.error("Please select an AI voice model first", toast_style);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/generateAISong`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          song_url: song_path, 
          username, 
          artist: selectedModel 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("AI song generated successfully!", toast_style);
      } else {
        toast.error(data.error, toast_style);
      }
    } catch (error) {
      toast.error("Error generating AI song", toast_style);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex w-full h-screen justify-center bg-black items-center">
        <BeatLoader size={30} color="#a855f7" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header */}
      <div className="relative px-8 pt-8 pb-6 border-b border-purple-900">
        <Link 
          href={`/${username}`}
          className="absolute top-8 right-8 text-purple-500 hover:text-purple-300 transition-colors"
        >
          <IoMdClose size={40} />
        </Link>
        <h1 className="text-3xl font-bold text-center mb-8">AI Song Generator</h1>
        
        {/* Model selector */}
        <div className="max-w-xl mx-auto mb-6">
          <label className="block text-purple-300 mb-2 text-sm">Select AI Voice Model</label>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-900 border border-purple-700 focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
          >
            {modelData && modelData.map((model, index) => (
              <option key={index} value={model.name}>
                {model.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Song list */}
      <div className="px-8 py-6">
        {songs && songs.length > 0 ? (
          <div className="grid gap-4 max-w-4xl mx-auto">
            {songs.map((song, index) => (
              <div 
                key={index} 
                className="flex items-center bg-gray-900 rounded-xl p-4 border border-purple-800 hover:border-purple-600 transition-all duration-300"
              >
                <img 
                  src={song.image_path} 
                  className="h-20 w-20 rounded-lg object-cover" 
                  alt={`${song.song_name} cover art`}
                />
                <div className="ml-4 flex-grow">
                  <div className="text-xl font-medium">{song.song_name}</div>
                  <div className="text-gray-400">By: {song.artist_name}</div>
                </div>
                <button
                  onClick={() => handleClick(song.song_path)}
                  className="flex items-center justify-center bg-purple-700 hover:bg-purple-600 text-white rounded-lg p-3 transition-colors"
                  disabled={isLoading}
                >
                  <FaPlus size={20} />
                  <span className="ml-2 hidden sm:inline">Generate</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">
              No songs found. Try uploading some to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}