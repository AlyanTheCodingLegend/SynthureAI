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
            <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1E1E1E] text-white flex justify-center items-center">
                <div className="max-w-md w-full bg-[rgba(30,30,30,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-transform duration-300 hover:transform hover:translate-y-[-5px] hover:shadow-lg hover:shadow-[rgba(145,70,255,0.1)]">
                    <div className="text-center mb-4">
                        <div className="bg-[rgba(145,70,255,0.8)] w-[60px] h-[60px] rounded-full flex justify-center items-center relative mb-2 z-1 mx-auto">
                            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <p className="text-center text-lg">
                        A confirmation link has been sent to your email, please head there to confirm your registration 😊
                    </p>
                </div>
            </div>
        )
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#121212] to-[#1E1E1E] text-white flex justify-center items-center relative">
            {/* Background decorations */}
            <div className="absolute top-[10%] left-[15%] w-[200px] h-[200px] rounded-full bg-[#9146FF] opacity-20 blur-[30px] z-0"></div>
            <div className="absolute bottom-[10%] right-[15%] w-[260px] h-[260px] rounded-full bg-[#6C0ACD] opacity-20 blur-[30px] z-0"></div>
            
            <div className="w-full max-w-md mx-auto">
                <div className="bg-[rgba(30,30,30,0.6)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] rounded-[20px] p-8 transition-transform duration-300 hover:transform hover:translate-y-[-5px] hover:shadow-lg hover:shadow-[rgba(145,70,255,0.1)]">
                    {/* Logo and branding */}
                    <div className="flex flex-col items-center mb-8 relative">
                        <div className="absolute w-[100px] h-[100px] bg-[radial-gradient(circle,rgba(145,70,255,0.2),transparent_70%)] top-[-20px] z-0"></div>
                        <div className="bg-[rgba(145,70,255,0.8)] w-[60px] h-[60px] rounded-full flex justify-center items-center relative mb-2 z-1">
                            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 5 Q25 15 15 25 M15 5 Q5 15 15 25" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                            </svg>
                        </div>
                        <div className="text-2xl font-bold text-white z-1 relative text-shadow shadow-[0_0_10px_rgba(145,70,255,0.5)]">SynthureAI</div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="flex mb-6 gap-2">
                        <div className="flex-1 py-3 text-center rounded-[20px] font-bold cursor-pointer transition-all duration-300 bg-[#9146FF] text-white">
                            Sign Up
                        </div>
                        <Link href="/login" className="flex-1">
                            <div className="py-3 text-center rounded-[20px] font-bold cursor-pointer transition-all duration-300 bg-[rgba(145,70,255,0.2)] text-white hover:bg-[rgba(145,70,255,0.3)]">
                                Log In
                            </div>
                        </Link>
                    </div>
                    
                    {/* Form content */}
                    <div>
                        <form onSubmit={handleSubmit(handleClick)} className="mb-6">
                        <div className="mb-5">
                            <label className="block mb-2 text-[#CCCCCC] text-sm">Username</label>
                            <div className="transition-transform duration-300 hover:translate-y-[-2px]">
                                <input
                                    className="w-full py-3 px-4 rounded-[10px] bg-[rgba(60,60,60,0.5)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#9146FF] focus:shadow-[0_0_0_2px_rgba(145,70,255,0.3)]"
                                    {...register("username", { required: true })}
                                    id="username"
                                    type="text"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>
                        
                        <div className="mb-5">
                            <label className="block mb-2 text-[#CCCCCC] text-sm">Email</label>
                            <div className="transition-transform duration-300 hover:translate-y-[-2px]">
                                <input
                                    className="w-full py-3 px-4 rounded-[10px] bg-[rgba(60,60,60,0.5)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#9146FF] focus:shadow-[0_0_0_2px_rgba(145,70,255,0.3)]"
                                    {...register("email", { required: true })}
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                />
                            </div>
                        </div>
                        
                        <div className="mb-5">
                            <label className="block mb-2 text-[#CCCCCC] text-sm">Password</label>
                            <div className="relative transition-transform duration-300 hover:translate-y-[-2px]">
                                <input
                                    className="w-full py-3 px-4 rounded-[10px] bg-[rgba(60,60,60,0.5)] border border-[rgba(255,255,255,0.1)] text-white text-sm focus:outline-none focus:border-[#9146FF] focus:shadow-[0_0_0_2px_rgba(145,70,255,0.3)]"
                                    {...register("password", { required: true })}
                                    id="password"
                                    type={showPass ? "text" : "password"}
                                    placeholder="Create a password"
                                    minLength={6}
                                    maxLength={15}
                                />
                                <button 
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[rgba(60,60,60,0.8)] border border-[rgba(255,255,255,0.3)] rounded-full w-6 h-6 flex justify-center items-center transition-all duration-300 hover:bg-[rgba(145,70,255,0.3)]"
                                    onClick={() => setShowPass(!showPass)}
                                >
                                    <SlEye size={14} className="text-white"/>
                                </button>
                            </div>
                        </div>
                        
                        <div className="mb-5">
                            <label className="block mb-2 text-[#CCCCCC] text-sm">Confirm Password</label>
                            <div className="relative transition-transform duration-300 hover:translate-y-[-2px]">
                                <input
                                    className={`w-full py-3 px-4 rounded-[10px] bg-[rgba(60,60,60,0.5)] border text-white text-sm focus:outline-none focus:shadow-[0_0_0_2px_rgba(145,70,255,0.3)] ${
                                        watch('confpass') && watch('password') && watch('confpass') !== watch('password')
                                        ? "border-red-500 focus:border-red-500" 
                                        : "border-[rgba(255,255,255,0.1)] focus:border-[#9146FF]"
                                    }`}
                                    {...register("confpass", { required: true })}
                                    id="confirmpassword"
                                    type={showConfPass ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    minLength={6}
                                    maxLength={15}
                                />
                                <button 
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-[rgba(60,60,60,0.8)] border border-[rgba(255,255,255,0.3)] rounded-full w-6 h-6 flex justify-center items-center transition-all duration-300 hover:bg-[rgba(145,70,255,0.3)]"
                                    onClick={() => setShowConfPass(!showConfPass)}
                                >
                                    <SlEye size={14} className="text-white"/>
                                </button>
                            </div>
                            {watch('confpass') && watch('password') && watch('confpass') !== watch('password') && (
                                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>
                        
                        <button
                            disabled={!watch("username") || !watch("email") || !watch("password") || !watch("confpass")}
                            type="submit"
                            className={`w-full py-4 px-4 rounded-[25px] font-bold transition-all duration-300 ${
                                (!watch("username") || !watch("email") || !watch("password") || !watch("confpass"))
                                ? "bg-slate-500 text-white cursor-not-allowed" 
                                : "bg-[#9146FF] text-white hover:bg-[#7d32e8] hover:transform hover:translate-y-[-2px] hover:shadow-[0_5px_15px_rgba(145,70,255,0.4)]"
                            }`}
                        >
                            Create Account
                        </button>
                        </form>
                    </div>
                    
                    <div className="text-center mt-6 text-[#CCCCCC] text-sm">
                        
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute top-[35%] left-[-20px] z-0">
                        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 30 Q25 10 40 30" stroke="#9146FF" strokeWidth="2" fill="none"/>
                            <circle cx="10" cy="30" r="5" fill="#9146FF"/>
                        </svg>
                    </div>
                    
                    <div className="absolute bottom-[30%] right-[-20px] z-0">
                        <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10 10 Q25 30 40 10" stroke="#9146FF" strokeWidth="2" fill="none"/>
                            <circle cx="40" cy="10" r="5" fill="#9146FF"/>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}