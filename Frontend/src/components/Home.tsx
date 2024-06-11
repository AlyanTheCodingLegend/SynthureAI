import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Player from "./Player";
import Layout from "./Layout";
import { useNavigate, useParams } from "react-router-dom";
import ShowPlaylistModel from "./ShowPlaylistModel";
import { BounceLoader } from "react-spinners";
import supabase from "./ClientInstance";

export default function Home(): JSX.Element | undefined {
    const [isOpen, setIsOpen] = useState<boolean>(true);
    const [openPlaylist, setOpenPlaylist] = useState<boolean>(false)
    const [playlistID, setPlaylistID] = useState<number>(-1)
    const [songArray, setSongArray] = useState<Array<string>>([])
    const [index, setIndex] = useState<number>(0)
    const [signOut, setSignOut] = useState<boolean>(false)
    const [playPlaylistID, setPlayPlaylistID] = useState<number | null>(null)
    const [isUniversallyPlaying, setIsUniversallyPlaying] = useState<boolean>(false)
    const [username, setUsername] = useState<string>("")
    const [verified, setVerified] = useState<boolean>(false)

    const toggleSidebar = () => setIsOpen(!isOpen);

    const userData = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        async function verifyUsername() {
            const tempUsername = userData.username || ""
            if (tempUsername!=="") {
                const {data, error} = await supabase.from('user_information').select('*').eq('username', tempUsername)
                if (error) {
                    navigate('/login')
                } else {
                    if (data.length===0) {
                        navigate('/login')
                    } else {
                        setUsername(tempUsername)
                        setVerified(true)
                    }
                }
            }
        }
        verifyUsername()
    // eslint-disable-next-line    
    }, [userData])        

    if (signOut) {
        return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700 z-40">
          <div className="text-center">
              <BounceLoader color="#36d7b7" />
          </div>
          <div className='mt-5 text-xl text-white'>Signing you out...</div>
        </div>
        )
    }

    if (verified) {
        return (
            <div className="flex h-screen overflow-none">
                <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} setSignOut={setSignOut}/>
                {openPlaylist ? <ShowPlaylistModel isOpen={isOpen} playPlaylistID={playPlaylistID} setPlayPlaylistID={setPlayPlaylistID} playlistid={playlistID} setOpenPlaylist={setOpenPlaylist} isUniversallyPlaying={isUniversallyPlaying} setIsUniversallyPlaying={setIsUniversallyPlaying} setSongArray={setSongArray} setIndex={setIndex} username={username} index={index}/> : <Layout isOpen={isOpen} setSongArray={setSongArray} username={username} setOpenPlaylist={setOpenPlaylist} setPlaylistID={setPlaylistID}/>}
                <Player isOpen={isOpen} songs={songArray} setSongs={setSongArray} index={index} setIndex={setIndex}/>
            </div>    
        )
    }
    
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700">
            <div className="text-center">
                <BounceLoader color="#36d7b7" />
            </div>
            <div className='mt-5 text-xl text-white'>Just a moment...</div>
        </div>
    )
}