"use client";

import { useState, type JSX } from "react";
import { toast } from "react-toastify";
import { BounceLoader } from "react-spinners";
import { SlEye } from "react-icons/sl";
import toast_style from "../_components/ToastStyle";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

type LoginInfo = {
    email: string;
    password: string;
}

export default function AuthUser(): JSX.Element {
    const { register, handleSubmit, watch } = useForm<LoginInfo>()
    const [showPass, setShowPass] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const router = useRouter()

    const handleClick: SubmitHandler<LoginInfo> = (data) => {
        setIsLoading(true)
        fetch("/api/loginUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                toast.error(data.error, toast_style)
                setIsLoading(false)
            } else {
                toast.success("Logged in successfully! 😎", toast_style)
                router.push(`/${data.username}`)
            }
        })
        .catch((err) => {
            toast.error(err.message, toast_style)
            setIsLoading(false)
        })
    }

    if (isLoading) {
        return (
          <div className="w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black to-slate-700">
              <div className="text-center">
                  <BounceLoader color="#36d7b7" />
              </div>
              <div className='mt-5 text-xl text-white'>Just a moment...</div>
          </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b text-white from-black via-gray-900 to-gray-800 flex justify-center items-center">
            <div className="max-w-4xl w-full bg-blue-600 rounded-lg shadow-lg p-8 flex">
                <div className="w-1/2 p-4 border-r-2 border-white">
                    <h2 className="text-2xl font-bold mb-4">Log In</h2>
                    <form onSubmit={handleSubmit(handleClick)}>
                        <input 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                            {...register("email", { required: true })}
                            type="email" 
                            placeholder="Enter your email address"
                        />
                        <div className="relative w-full">
                            <input 
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                                {...register("password", { required: true })}
                                type={showPass ? "text" : "password"}
                                placeholder="Enter your password"
                            />
                            <button
                                type="button"
                                className="absolute top-5 transform -translate-y-1/2 right-3" 
                                onClick={() => setShowPass(!showPass)}
                            >
                                <SlEye size={25} className="text-white"/>
                            </button>
                        </div>
                        <button 
                            type="submit"
                            disabled={!watch("email") || !watch("password")} 
                            className={(!watch("email") || !watch("password")) ? "w-full bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-not-allowed" : "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                        >
                            Log In
                        </button>
                    </form>
                    <Link href='/signup'>
                        <button 
                            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Sign Up Instead
                        </button>
                    </Link>
                </div>
                <div className="w-1/2 p-4 flex flex-col items-center justify-center text-center">
                    <img alt="Logo" className="rounded-lg" width={250} height={250}/>
                    <h1 className="text-4xl font-bold mb-2">SynthureAI</h1>
                    <h2 className="texl-xl">😍 The only music application you'll ever need for your late night vibing sessions 😍</h2>
                    <p className="text-xl">🤘 Vibe On 😎 🤘</p>
                </div>
            </div>
            
        </div>
    )
}