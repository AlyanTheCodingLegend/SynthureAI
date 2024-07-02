"use client";

import { useEffect, useState } from "react"
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";
import '../_styles/Sidebar.css';
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import supabase from "./ClientInstance";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";
import { PiPlaylistDuotone, PiSignOut } from "react-icons/pi";
import { LuUpload } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";
import { LiaSpotify } from "react-icons/lia";
import { CgMediaLive, CgOptions } from "react-icons/cg";
import { ImLab } from "react-icons/im";
import PlaylistModel from "./PlaylistModel";
import SongUploadModel from "./SongUploadModel";
import { ClipLoader } from "react-spinners";
import usePfp from "../_hooks/usePfp";
import addTimestampToUrl from "../_utils/addTimestampToUrl";
import generateSessionID from "../_utils/generateSessionID";

type SidebarProps = {
  isOpen: boolean;
  socket: WebSocket | null;
  sessionID: number;
  userID: string;
  isAdmin: boolean;
  songs: Array<string>;
  index: number;
  duration: number;
  progress: number;
  setSessionID: (value: number) => void;
  setSocket: (value: WebSocket | null) => void;
  toggleSidebar: () => void;
  setSignOut: (value: boolean) => void;
  setIsAdmin: (value: boolean) => void;
}

export default function Sidebar ({isOpen, isAdmin, socket, userID, songs, index, sessionID, setSessionID, setSocket, toggleSidebar, setSignOut, setIsAdmin, duration, progress}: SidebarProps): JSX.Element {
    
    const [pfpPath, setPfpPath] = useState<string | null>(null)
    const [isPlaylistModalOpen, setPlaylistModalOpen] = useState<boolean>(false)
    const [isUploadModelOpen, setUploadModelOpen] = useState<boolean>(false)
    const [tempSessionID, setTempSessionID] = useState<number>(-1)

    const username = useParams<{username: string}>().username

    const router = useRouter()

    const {data: pfpData, error: pfpError} = usePfp(username)
    
    useEffect(() => {
      if (pfpError) {
        toast.error(pfpError, toast_style)
      } else if (pfpData) {
        setPfpPath(addTimestampToUrl(pfpData))
      }
    }, [pfpData, pfpError])  

    const startSession = async () => {
      setIsAdmin(true)

      const sessionId = generateSessionID()
      setSessionID(sessionId)
    
      const socket = new WebSocket("ws://localhost:5000")
      setSocket(socket)
    }

    const endSession = () => {
      socket?.send(JSON.stringify({ type: "leave", sessionID: sessionID, userID: userID }))
    }

    const togglePlaylistModal = () => {
      setPlaylistModalOpen(!isPlaylistModalOpen);
    }

    const toggleUploadModal = () => {
      setUploadModelOpen(!isUploadModelOpen);
    }  

    const handleSyncing = () => {
      if (isAdmin) {
        socket?.send(JSON.stringify({ type: "sync", sessionID: sessionID, songs: songs, index: index, duration: duration, progress: progress}))
      } else {
        toast.error("Only the session admin can sync songs", toast_style)
      }  
    }

    const handleSessionID = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (Number(e.target.value) >= 100 && Number(e.target.value) <= 999){
        setTempSessionID(Number(e.target.value))
      }  
    }  

    const handleClick = async () => {
      setSignOut(true)
      const {error} = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message, toast_style)
      } else {
        router.push('/login')
      }
      setSignOut(false)
    }

    const joinSession = () => {
      if (tempSessionID !== -1) {
        setIsAdmin(false)

        setSessionID(tempSessionID)
      
        const socket = new WebSocket("ws://localhost:5000")
        setSocket(socket)
      } else {
        toast.error("Please enter a valid session ID", toast_style)
      }  
    }

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'} transition-width no-scrollbar`}>
      <div className="sidebar-header flex items-center p-4">
        {!isOpen && (
          <button onClick={toggleSidebar} className="">
            <BiArrowToRight size={30} />
          </button>
        )}
        {isOpen && (
          <>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-700 to-purple-700 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                {pfpPath ? ( 
                  <img
                    onClick={() => router.push(`/profile/${username}`)}
                    src={pfpPath}
                    alt="Profile"
                    className="relative pfp rounded-full cursor-pointer w-10 h-10"
                  />
                ) : (
                  <div className="flex items-center justify-center">
                    <ClipLoader size={50} color="white"/>
                  </div>
                )}   
              </div>
            <div className="text-xl text-center ml-4">{username}</div>
            <button onClick={toggleSidebar} className="ml-auto">
              <BiArrowToLeft size={30}/>
            </button>
          </>
        )}
      </div>
      {isOpen && (
        <>
        <div className="border-t-2 border-gray-300"></div>
        <div className="ml-2 mt-4 text-2xl flex items-center text-center text-white"><CgOptions className="mr-2"/>Options</div>
        <div className="space-y-8 p-4 h-5/6">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div
                className="relative flex items-center justify-center p-4 text-gray-400 cursor-pointer transition duration-300 rounded-xl bg-black group-hover:text-white text-center text-xl"
                onClick={togglePlaylistModal}
              >
                <PiPlaylistDuotone size={30} className="mr-2" />
                Create Playlists
              </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
            <div
              className="relative flex items-center justify-center p-4 text-gray-400 cursor-pointer transition duration-300 rounded-xl bg-black hover:text-white text-center text-xl"
              onClick={toggleUploadModal}
            >
              <LuUpload size={30} className="mr-2" />
              Upload Songs
            </div>
          </div>
          <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>  
            <div
              className="relative flex items-center justify-center p-4 text-gray-400 cursor-pointer transition duration-300 rounded-xl bg-black hover:text-white text-center text-xl"
              onClick={() => router.push(`/${username}/aigen`)}
            >
              <RiRobot2Line size={30} className="mr-2" />
              Create AI-Generated Songs
            </div>
          </div>
          {(!socket) ? (
          <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>  
            <div
              className="relative flex items-center justify-center p-4 text-gray-400 cursor-pointer transition duration-300 rounded-xl bg-black hover:text-white text-center"
              onClick={startSession}
            >
              <CgMediaLive size={30} className="mr-2" />
              Create a real-time collaborative session
            </div>
          </div>) : (
            <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>  
              <div
                className="relative flex items-center justify-center p-4 text-gray-400 cursor-pointer transition duration-300 rounded-xl bg-black hover:text-white text-center"
              >
                <CgMediaLive size={30} className="mr-2" />
                {`Connected to session: ${sessionID}`}
                <div>
                  <button className="bg-green-800 hover:bg-green-600 text-white rounded-lg mb-1" onClick={handleSyncing}>Sync songs</button>
                  <button className="bg-red-800 hover:bg-red-600 text-white rounded-lg" onClick={endSession}>Disconnect</button>
                </div>
              </div>
            </div>
          )}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-700 to-purple-700 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
              <div
                className="relative flex items-center justify-center p-4 text-gray-400 cursor-pointer transition duration-300 rounded-xl bg-black group-hover:text-white text-center text-xl"
              >
                <PiPlaylistDuotone size={30} className="mr-2" />
                <div>
                  <div className="text-lg">Join A Collaborative Session</div>
                  <input type="number" onChange={handleSessionID} min={100} max ={999} className="text-white rounded-md text-center bg-black border border-white "/>
                </div>
                <button className={socket!==null ? "cursor-not-allowed bg-gray-600 text-white rounded-lg" :"bg-green-800 text-white hover:bg-green-600 rounded-lg"} onClick={joinSession} disabled={socket!==null}>Join</button>
              </div>
          </div>
          <div>
            <div className="border border-opacity-100 border-gray-300"></div>
            <div className="ml-2 text-2xl flex items-center text-center text-white mt-4"><ImLab className="mr-2"/>Beta Feature</div>  
          </div>
          <div
            className="flex items-center justify-center p-4 cursor-pointer transition duration-300 rounded-full bg-green-600 hover:bg-green-500 text-center hover:border-white border hover:text-black"
            onClick={() => toast.info("This feature is currently in development", toast_style)}
          >
            <LiaSpotify size={30} className="mr-2" />
            Login with Spotify®
          </div>
          <div>
            <div className="border-gray-300 border-opacity-100 border w-full"></div>
            <div
              className="border-white flex items-center justify-center text-gray-300 hover:text-white p-2 cursor-pointer transition duration-300 rounded-full bg-red-800 hover:bg-red-700 text-center mt-4"
              onClick={handleClick}
            >
              <PiSignOut size={30} className="mr-2" />
              Sign Out
            </div>
          </div>  
        </div>
        </>
      )}
      {isPlaylistModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <PlaylistModel username={username} onClick={togglePlaylistModal}/>
        </div>
      )}
      {isUploadModelOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <SongUploadModel username={username} onClick={toggleUploadModal}/>
        </div>
      )}
    </div> 
  );
};

