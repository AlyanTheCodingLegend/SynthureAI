"use client";
import { useEffect, useState, type JSX } from "react";
import { toast } from "react-toastify";
import toast_style from "@/app/_components/ToastStyle";
import 'react-toastify/dist/ReactToastify.css';
import bcrypt from 'bcryptjs';
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SlEye } from "react-icons/sl";
import { BounceLoader, ClipLoader } from "react-spinners";
import usePfp from "@/app/_hooks/usePfp";
import usePlaylists from "@/app/_hooks/usePlaylists";
import { Playlist } from "@/app/_types/types";
import { deleteUserFolders, deleteUserServer, getUserInfoServer, handleSubmit, signOutServer } from "./actions";
import { Music } from "lucide-react";

export default function ProfilePage(): JSX.Element {
    const [popup, setPopup] = useState<boolean>(false);
    const [showPass, setShowPass] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [signOut, setSignOut] = useState<boolean>(false);
    const [pass, setPass] = useState<string>("");
    const [userID, setUserID] = useState<string | null>(null);
    const [pfp, setPfp] = useState<Array<File>>([]);
    const [playlists, setPlaylists] = useState<Array<Playlist>>([]);
    const [pfpPath, setPfpPath] = useState<string>("");
    const [newPfpPath, setNewPfpPath] = useState<string>("");
    const router = useRouter();
    const params = useParams<{username: string}>();
    const username = params.username;
    const {data: pfpData, error: pfpError} = usePfp(username);
    const {data: playlistData, error: playlistError} = usePlaylists(username);
    
    
    useEffect(() => {
      if (pfpError) {
          toast.error(pfpError, toast_style);
      } else if (pfpData) {
          setPfpPath(pfpData);
      }
      if (playlistError) {
          toast.error(playlistError, toast_style);
      } else if (playlistData) {
          setPlaylists(playlistData);
      }
    }, [pfpData, pfpError, playlistData, playlistError]);  

    const handleClick = async () => {
        setSignOut(true);
        const {error} = await signOutServer();
        if (error) {
          toast.error(error.message, toast_style);
        }
        router.push('/login');
    }
    
    const handleProfilePicChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        setPfp([event.target.files[0]]);
        if (newPfpPath!=="") {
          URL.revokeObjectURL(newPfpPath);
        }
        setNewPfpPath(URL.createObjectURL(event.target.files[0]));
      }  
    }
    
    const handleClickFour = async () => {
      setPopup(true);
    }
    
    const handlePassSubmit = async () => {
      setIsLoading(true);

      const { data, error } = await getUserInfoServer(username);

      if (error) {
        setIsLoading(false);
        toast.error(error.message, toast_style);
      } else {
        if (data.length !== 0) {
          setUserID(data[0].userid);
          const storedHash = data[0].hashpass;

          // Compare hashed passwords
          bcrypt.compare(pass, storedHash, async function(compareErr: Error | null, result: boolean) {
            if (compareErr) {
              setIsLoading(false);
              toast.error(compareErr.message, toast_style);
            } else {
              if (result) {
                if (userID !== null) {
                  const { error: deleteUserError } = await deleteUserServer(userID);
                  if (deleteUserError) {
                    setIsLoading(false);
                    toast.error(deleteUserError.message, toast_style);
                  } else {
                    const deleteFolderError = await deleteUserFolders(username);
                    if (deleteFolderError) {
                      setIsLoading(false);
                      toast.error(deleteFolderError.message, toast_style);
                    } else {
                      toast.success('Account has been successfully deleted', toast_style);
                      router.push('/login');
                      setIsLoading(false);
                      setSignOut(true);
                    }
                  }
                } else {
                  setIsLoading(false);
                  toast.error('Unexpected error!', toast_style);
                }
              } else {
                setIsLoading(false);
                toast.error('Wrong password!', toast_style);
              }
            }
          });
        } else {
          setIsLoading(false);
          toast.error('User not found', toast_style);
        }
      }
    };

    if (signOut) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700 z-40">
          <div className="text-center">
              <BounceLoader color="#36d7b7" />
          </div>
          <div className='mt-5 text-xl text-white'>Signing you out...</div>
        </div>
      );
    }
    
    if (isLoading) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700">
            <div className="text-center">
                <BounceLoader color="#36d7b7" />
            </div>
            <div className='mt-5 text-xl text-white'>Just a moment...</div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen min-w-screen bg-gray-900 text-white flex flex-col justify-center items-center p-4">
            {popup && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-50">
                    <div className="text-white p-8 rounded-lg relative w-11/12 md:w-7/12 bg-gray-800 border border-purple-600">
                        <div className="relative w-full mb-4">
                            <input
                                placeholder="Enter your password to confirm account deletion"
                                type={showPass ? "text" : "password"}
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="text-white w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none"
                            />
                            <button
                                className="absolute top-1/2 transform -translate-y-1/2 right-3"
                                onClick={() => setShowPass(!showPass)}
                            >
                                <SlEye size={25} color="white" />
                            </button>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handlePassSubmit}
                                className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600 transition duration-300"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => { setPopup(false); setPass(""); setShowPass(false); }}
                                className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600 transition duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="bg-gray-900 text-white p-6 rounded-lg border border-purple-600 w-full max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Welcome, {username} <span role="img" aria-label="cool">😎</span></h1>
                </div>
                
                <div className="flex flex-col items-center mb-6">
                    <div className="relative w-16 h-16 mb-4">
                        {(pfpPath === "") ? (
                            <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                                <ClipLoader size={30} color="white"/>
                            </div>
                        ) : (
                            <>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleProfilePicChange} 
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                                />
                                {pfp[0] ? (
                                    <img 
                                        src={newPfpPath} 
                                        alt="Profile" 
                                        className="absolute inset-0 w-16 h-16 object-cover rounded-full z-0"
                                    />
                                ) : (
                                    <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center text-2xl font-bold">
                                        {username.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    
                    <button 
                        onClick={() => handleSubmit(username, pfp)} 
                        disabled={!pfp.length} 
                        className="bg-purple-600 text-white py-2 px-12 rounded-full w-full max-w-xs mb-4 hover:bg-purple-700 transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        Save
                    </button>
                    
                    <div className="flex justify-between w-full max-w-xs mb-4">
                        <Link href={`/${username}`}>
                            <button className="bg-gray-700 text-white py-2 px-8 rounded-full hover:bg-gray-600 transition duration-300">
                                Home
                            </button>
                        </Link>
                        <button 
                            onClick={handleClick}
                            className="bg-red-500 text-white py-2 px-8 rounded-full hover:bg-red-600 transition duration-300"
                        >
                            Sign Out
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleClickFour}
                        className="bg-red-500 text-white py-2 px-8 rounded-full w-full max-w-xs hover:bg-red-600 transition duration-300"
                    >
                        Delete Account
                    </button>
                </div>
                
                <div className="border-t border-purple-700 pt-4 mb-6">
                    <Link href={`/${username}/${process.env.NEXT_PUBLIC_MYSONGS_ID}`}>
                        <div className="bg-purple-900/30 rounded-lg p-4 mb-4 flex justify-between items-center hover:bg-purple-900/50 transition duration-300 cursor-pointer">
                            <span className="text-xl font-bold">My Songs</span>
                            <Music className="text-purple-300" />
                        </div>
                    </Link>
                </div>
                
                <div className="border-t border-purple-700 pt-4">
                    <h2 className="text-xl font-bold mb-4">Top Playlists</h2>
                    
                    <div className="space-y-3">
                        {playlists && playlists.length !== 0 ? (
                            playlists.map((playlist, index) => (
                                <Link key={index} href={`/${username}/${playlist.playlist_id}`}>
                                    <div className="bg-purple-900/30 rounded-lg p-4 flex justify-between items-center hover:bg-purple-900/50 transition duration-300 cursor-pointer">
                                        <span>{playlist.playlist_name}</span>
                                        <Music className="text-purple-300" />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="bg-purple-900/30 rounded-lg p-4 flex justify-between items-center">
                                <span>No playlists to show!</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}