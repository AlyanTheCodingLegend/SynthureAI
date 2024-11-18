"use client";

import { useEffect, useState, type JSX } from "react";
import Layout from "../_components/Layout";
import { BounceLoader } from "react-spinners";
import useVerifyUsername from "../_hooks/useVerifyUsername";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../_states/store";
import { setUserID } from "../_states/songArraySlice";

export default function Home(): JSX.Element | undefined {
    const [verified, setVerified] = useState<boolean>(false)

    const signOut = useSelector((state: RootState) => state.songs.signOut)
    const openPlaylist = useSelector((state: RootState) => state.songs.openPlaylist)
    const playlistID = useSelector((state: RootState) => state.songs.playlistID)

    const dispatch = useDispatch<AppDispatch>()

    const router = useRouter();

    const params = useParams<{username: string}>()
    
    const {data, error} = useVerifyUsername(params.username)
    
    useEffect(() => {
        if (error) {
            router.push('/login')
        } else {
            if (data) {
                dispatch(setUserID(data.userid))
                setVerified(true)
            }
        }
    }, [data, error])    
        
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
        if (openPlaylist) {
            router.push(`/${params.username}/${playlistID}`)
        }
        return (
            <Layout />  
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