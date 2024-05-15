import React, { useEffect, useState } from "react"
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";
import './Sidebar.css';
import { useNavigate, useParams } from "react-router-dom";
import supabase from "./ClientInstance";
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";

export default function Sidebar () {
    const [isOpen, setIsOpen] = useState(true);
    const [pfpPath, setPfpPath] = useState("https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/assets/defaultpfp.jpg")
    const toggleSidebar = () => setIsOpen(!isOpen);

    const {username} = useParams()

    const navigate = useNavigate()

    useEffect(() => {
      const loadPfp = async () => {
        if (username) {
          const {data, error} = await supabase.from('user_information').select('pfp_path').eq('username', username)
          if (error) {
            toast.error(error.message, toast_style)
          } else {
            setPfpPath(data[0].pfp_path)
          }
        }  
      }
      loadPfp()  
    },[username])


  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="sidebar-header">
      {!isOpen && (
          <button onClick={toggleSidebar} className="toggle-btn">
            <BiArrowToRight size={30} />
          </button>
        )}

        {isOpen && (
        <>
            {pfpPath && (<img onClick={() => navigate(`/profile/${username}`)} src={pfpPath} alt="Profile" className="pfp"/>)}
            <div className="text-xl">{username}</div>
            <button onClick={toggleSidebar} className="toggle-btn"><BiArrowToLeft size={30}/></button>
        </>
        )}
      </div>
      {isOpen && (
      <div className="sidebar-content">
        <div className="sidebar-button" onClick={() => navigate(`/playlists/${username}`)}>Create Playlists</div>
        <div className="sidebar-button" onClick={() => navigate(`/songuploader/${username}`)}>Upload Songs</div>
        <div className="spotify-button">Login with Spotify</div>
      </div>
      )}
    </div> 
  );
};

