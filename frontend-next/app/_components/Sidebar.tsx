"use client";

import { useEffect, useState, type JSX } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../_states/store";
import { BiArrowToLeft, BiArrowToRight } from "react-icons/bi";
import { PiPlaylistDuotone, PiSignOut } from "react-icons/pi";
import { LuUpload } from "react-icons/lu";
import { CgMediaLive } from "react-icons/cg";
import { RiRobot2Line } from "react-icons/ri";
import { LiaSpotify } from "react-icons/lia";
import { ImLab } from "react-icons/im";
import { toast } from "react-toastify";
import { signOutServer } from "../_actions/_actions";
import PlaylistModel from "./PlaylistModel";
import SongUploadModel from "./SongUploadModel";
import toast_style from "./ToastStyle";
import usePfp from "../_hooks/usePfp";
import addTimestampToUrl from "../_utils/addTimestampToUrl";
import generateSessionID from "../_utils/generateSessionID";
import {
  setIsOpen,
  setSignOut,
  setPlaylistID,
  setOpenPlaylist,
  setSessionID,
  setSocket,
  setIsAdmin
} from "../_states/songArraySlice";
import "../_styles/Sidebar.css";

export default function Sidebar(): JSX.Element {
  const [isPlaylistModalOpen, setPlaylistModalOpen] = useState(false);
  const [isUploadModelOpen, setUploadModelOpen] = useState(false);
  const [pfpPath, setPfpPath] = useState<string | null>(null);
  const [tempSessionID, setTempSessionID] = useState<number>(-1);

  const username = useParams<{ username: string }>().username;
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const isOpen = useSelector((state: RootState) => state.songs.isOpen);
  const socket = useSelector((state: RootState) => state.songs.socket);
  const userID = useSelector((state: RootState) => state.songs.userID);

  const { data: pfpData } = usePfp(username);

  useEffect(() => {
    if (pfpData !== null) {
      setPfpPath(pfpData === "" ? "/default-avatar.png" : addTimestampToUrl(pfpData));
    }
  }, [pfpData]);

  const toggleSidebar = () => dispatch(setIsOpen(!isOpen));

  const handleSignOut = async () => {
    dispatch(setSignOut(true));
    const success = await signOutServer();
    if (success) router.push("/login");
    dispatch(setSignOut(false));
  };

  const startSession = () => {
    dispatch(setIsAdmin(true));
    const id = generateSessionID();
    dispatch(setSessionID(id));
    const socket = new WebSocket("ws://localhost:5000");
    dispatch(setSocket(socket));
  };

  const joinSession = () => {
    if (tempSessionID !== -1) {
      dispatch(setIsAdmin(false));
      dispatch(setSessionID(tempSessionID));
      const socket = new WebSocket("ws://localhost:5000");
      dispatch(setSocket(socket));
    } else {
      toast.error("Please enter a valid session ID", toast_style);
    }
  };

  const toggleMySongs = () => {
    dispatch(setPlaylistID(Number(process.env.NEXT_PUBLIC_MYSONGS_ID)));
    dispatch(setOpenPlaylist(true));
  };

  return (
    <div className={`sidebar custom-scrollbar ${isOpen ? "" : "collapsed"}`}>
      <div className="sidebar-header">
        {!isOpen ? (
          <button className="toggle-btn" onClick={toggleSidebar}>
            <BiArrowToRight size={20} />
          </button>
        ) : (
          <>
            <img
              onClick={() => router.push(`/profile/${username}`)}
              src={pfpPath || "../profile.png"}
              alt="Profile"
              className="pfp"
              style={{ zIndex: 0 }}
            />
            <span className="username-label">{username}</span>
            <button className="toggle-btn" onClick={toggleSidebar}>
              <BiArrowToLeft size={20} />
            </button>
          </>
        )}
      </div>

      {isOpen && (
        <>
          <div className="sidebar-section">
            <h3 className="sidebar-title-logo"><span className="logo-icon">🎧</span> <b>SynthureAI</b></h3>
            <div className="sidebar-button" onClick={() => setPlaylistModalOpen(true)}>
              <PiPlaylistDuotone size={20} className="icon" />
              Create Playlist
            </div>
            <div className="sidebar-button" onClick={() => setUploadModelOpen(true)}>
              <LuUpload size={20} className="icon" />
              Upload Songs
            </div>
            <div className="sidebar-button" onClick={toggleMySongs}>
              <LuUpload size={20} className="icon" />
              My Songs
            </div>
            <div className="sidebar-button" onClick={() => router.push(`/${username}/aigen`)}>
              <RiRobot2Line size={20} className="icon" />
              Create AI-Generated Songs
            </div>
            <div className="sidebar-button" onClick={startSession}>
              <CgMediaLive size={20} className="icon" />
              Start Collaborative Session
            </div>
            <div className="sidebar-button join-session-block">
            <CgMediaLive size={20} className="icon" />
            <div className="join-session-content">
              <div className="join-text">Join Collab Session</div>
              <div className="join-input-row">
                <input
                  type="number"
                  placeholder="Session ID"
                  onChange={(e) => setTempSessionID(Number(e.target.value))}
                  className="session-input"
                />
                <button onClick={joinSession} className="join-btn">Join</button>
              </div>
            </div>
          </div>

          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Beta Feature</h3>
            <div
              className="spotify-button"
              onClick={() => toast.info("This feature is currently in development", toast_style)}
            >
              <LiaSpotify size={20} className="icon" />
              Login with Spotify®
            </div>
          </div>

          <div className="sidebar-button" onClick={handleSignOut}>
            <PiSignOut size={20} className="icon" />
            Sign Out
          </div>
        </>
      )}

      {isPlaylistModalOpen && (
        <div className="fixed-modal">
          <PlaylistModel username={username} onClick={() => setPlaylistModalOpen(false)} />
        </div>
      )}
      {isUploadModelOpen && (
        <div className="fixed-modal">
          <SongUploadModel username={username} onClick={() => setUploadModelOpen(false)} />
        </div>
      )}
    </div>
  );
}
