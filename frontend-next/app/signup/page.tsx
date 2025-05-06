"use client";

import { useState, type JSX } from "react";
import { toast } from "react-toastify";
import { BounceLoader } from "react-spinners";
import { SlEye } from "react-icons/sl";
import toast_style from "../_components/ToastStyle";
import 'react-toastify/dist/ReactToastify.css';
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";

type SignupInfo = {
    email: string;
    password: string;
    username: string;
    confpass: string;
}

export default function CreateUser(): JSX.Element {
    const { register, handleSubmit, watch } = useForm<SignupInfo>()
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPass, setShowPass] = useState<boolean>(false);
    const [showConfPass, setShowConfPass] = useState<boolean>(false);
    const [msg, setMsg] = useState<boolean>(false);
    
    const handleClick: SubmitHandler<SignupInfo> = (data) => {
        if (data.password !== data.confpass) {
            toast.error("Passwords do not match!", toast_style);
            return;
        }
        setIsLoading(true);
        fetch("/api/signupUser", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
        .then((res) => res.json())
        .then((data) => {
            if (data.error) {
                toast.error(data.error, toast_style);
                setIsLoading(false);
            } else if (data.message) {
                toast.success("Account created successfully! 😎", toast_style);
                setMsg(true);
                setIsLoading(false);
            }
        })
        .catch((err) => {
            toast.error(err.message, toast_style);
            setIsLoading(false);
        })
        
    };

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

    if (msg) {
        return (
            <div className="min-h-screen bg-black text-white flex justify-center items-center">
                <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
                    {'A confirmation link has been sent to your email, please head there to confirm your registration 😊'}
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-black via-gray-900 to-gray-800 bg-opacity-80 backdrop-blur-md">
            <div className="max-w-4xl w-full bg-blue-600 rounded-lg shadow-lg text-white p-8 flex">
                <div className="w-1/2 p-4 border-r-4 border-white">
                    <h2 className="text-2xl font-bold mb-4">Create Account</h2>
                    <form onSubmit={handleSubmit(handleClick)}>
                    <input
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                        {...register("username", { required: true })}
                        type="text"
                        placeholder="Enter your username"
                    />
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
                            minLength={6}
                            maxLength={15}
                        />
                        <button className="absolute top-0 right-0 mt-2 mr-2" onClick={() => setShowPass(!showPass)}><SlEye size={25} className="mb-4 mr-2 ml-2" color="white" /></button>
                    </div>
                    <div className="relative w-full">
                        <input
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                            {...register("confpass", { required: true })}
                            type={showConfPass ? "text" : "password"}
                            placeholder="Confirm your password"
                            minLength={6}
                            maxLength={15}
                        />
                        <button className="absolute top-0 right-0 mt-2 mr-2" type="button" onClick={() => setShowConfPass(!showConfPass)}><SlEye size={25} className="mb-4 mr-2 ml-2" color="white" /></button>
                    </div>
                    <button
                        type="submit"
                        // disabled={!username || !email || !pass || !confpass}
                        className={(true) ? "w-full bg-slate-500 hover:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" : "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                    >
                        Sign Up
                    </button>
                    </form>
                    <Link href='/login'>
                        <button
                            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Log In Instead
                        </button>
                    </Link>
                </div>
                <div className="w-1/2 p-4 flex flex-col justify-center items-center text-center">
                <img alt="Logo" className="rounded-lg" width={250} height={250}/>
                    <h2 className="texl-xl">😍 The only music application you'll ever need for your late night vibing sessions 😍</h2>
                    <div className="border-white border-t-2"></div>
                    <p className="text-xl">🤘 Vibe On! 🤘</p>
                </div>
            </div>
            
        </div>
    )
}