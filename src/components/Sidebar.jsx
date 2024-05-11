import { ToastContainer, toast } from "react-toastify"
import supabase from "./ClientInstance"
import { ProfilePage } from "./ProfilePage"
import toast_style from "./ToastStyle"
import React, { useState } from "react"

export default function Sidebar ({username}) {
    const [pfplink, setPfplink] = useState(null)

    const loadPfp = async () => {
        const {data, error} = await supabase.from('user_information').select('pfp_path').eq('username', username)
        if (error) {
            toast.error(error.message, toast_style)
        } else {
            setPfplink(data[0].pfp_path)
        }
    }

    loadPfp()

    const handleClick = () => {
        <ProfilePage />
    }

    return (
        <div className="fixed w-1/6 from-slate-800 text-white bg-gradient-to-b to-blue-600 h-screen">
            <div className="relative">
                <div className="absolute inset-0.5 bg-gradient-to-r from-purple-700 to-blue-700 rounded-2xl blur"></div>
                <div className="relative flex bg-black w-full h-1/6 rounded-2xl place-items-center justify-center items-center divide-x divide-blue-600 mt-2">
                    {pfplink ? (<span><img onClick={handleClick} src={pfplink} alt='pfp' style={{ borderRadius: '50%' }}></img></span>) : (<svg xlinkHref='https://www.google.com/url?sa=i&url=https%3A%2F%2Fen.m.wikipedia.org%2Fwiki%2FFile%3ADefault_pfp.svg&psig=AOvVaw1lPMm-qodLFvWJcarTRP9M&ust=1715266761676000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCJDBxMWo_oUDFQAAAAAdAAAAABAI' alt='default pfp' width={'20px'} height={'20px'}></svg>)}
                    <span className="flex items-center text-sm text-white">AlyanDaGoat</span>
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
        </div>
    )
}
