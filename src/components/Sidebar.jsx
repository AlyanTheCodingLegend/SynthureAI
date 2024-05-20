import React, { useEffect, useState } from "react"
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";
import './Sidebar.css';
import { useNavigate, useParams } from "react-router-dom";
import supabase from "./ClientInstance";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";
import { PiPlaylistDuotone, PiSignOut } from "react-icons/pi";
import { LuUpload } from "react-icons/lu";
import { RiRobot2Line } from "react-icons/ri";
import { LiaSpotify } from "react-icons/lia";
import { CgOptions } from "react-icons/cg";
import { ImLab } from "react-icons/im";
import { BounceLoader } from "react-spinners";
import PlaylistModel from "./PlaylistModel";
import SongUploadModel from "./SongUploadModel";

export default function Sidebar ({isOpen, toggleSidebar}) {
    
    const [pfpPath, setPfpPath] = useState("https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/assets/defaultpfp.jpg")
    const [isPlaylistModalOpen, setPlaylistModalOpen] = useState(false)
    const [isUploadModelOpen, setUploadModelOpen] = useState(false)
    const [signout, setSignout] = useState(false)

    const {username} = useParams()

    const navigate = useNavigate()

    function addTimestampToUrl(url) {
      var timestamp = new Date().getTime();
      return url + (url.indexOf('?') === -1 ? '?' : '&') + 'timestamp=' + timestamp;
    } 

    const togglePlaylistModal = () => {
      setPlaylistModalOpen(!isPlaylistModalOpen);
    }

    const toggleUploadModal = () => {
      setUploadModelOpen(!isUploadModelOpen);
    }  

    const handleClick = async () => {
      setSignout(true)
      const {error} = await supabase.auth.signOut()
      if (error) {
        toast.error(error.message, toast_style)
      } else {
        navigate('/login')
      }
      setSignout(false)
    }

    useEffect(() => {
      const loadPfp = async () => {
        if (username) {
          const {data, error} = await supabase.from('user_information').select('pfp_path').eq('username', username)
          if (error) {
            toast.error(error.message, toast_style)
          } else {
            if (data[0].pfp_path) {
              setPfpPath(addTimestampToUrl(data[0].pfp_path))
            }
          }
        } 
      }
      loadPfp()  
    },[])

    if (signout) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700 z-40">
          <div className="text-center">
              <BounceLoader color="#36d7b7" />
          </div>
          <div className='mt-5 text-xl text-white'>Signing you out...</div>
        </div>
      )
    }

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'} transition-width`}>
      <div className="sidebar-header flex items-center p-4">
        {!isOpen && (
          <button onClick={toggleSidebar} className="toggle-btn p-2">
            <BiArrowToRight size={30} />
          </button>
        )}
        {isOpen && (
          <>
            {pfpPath && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-700 to-purple-700 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <img
                  onClick={() => navigate(`/profile/${username}`)}
                  src={pfpPath}
                  alt="Profile"
                  className="relative pfp rounded-full cursor-pointer w-10 h-10"
                />
              </div>
            )}
            <div className="text-xl ml-2">{username}</div>
            <button onClick={toggleSidebar} className="toggle-btn ml-auto p-2">
              <BiArrowToLeft size={30}/>
            </button>
          </>
        )}
      </div>
      {isOpen && (
        <>
        <div className="mt-2 border-t-2 border-gray-300"></div>
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
              onClick={() => {}}
            >
              <RiRobot2Line size={30} className="mr-2" />
              Create AI-Generated Songs
            </div>
          </div>
          <div className="border-t-2 border-gray-300"></div>
          <div className="-mt-2 ml-2 text-2xl flex items-center text-center text-white"><ImLab className="mr-2"/>Beta Feature</div>  
          <div
            className="flex items-center justify-center p-4 cursor-pointer transition duration-300 rounded-full bg-green-600 hover:bg-green-500 text-center hover:border-white border hover:text-black"
            onClick={() => {}}
          >
            <LiaSpotify size={30} className="mr-2" />
            Login with Spotify®
          </div>
          <div className="-mt-2 border-t-2 border-gray-300"></div> 
          <div
            className="border-white flex items-center justify-center text-gray-300 hover:text-white p-2 cursor-pointer transition duration-300 rounded-full bg-red-800 hover:bg-red-700 text-center"
            onClick={handleClick}
          >
            <PiSignOut size={30} className="mr-2" />
            Sign Out
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

