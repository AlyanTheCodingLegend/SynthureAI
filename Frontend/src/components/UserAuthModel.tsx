import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { BounceLoader } from "react-spinners";
import { SlEye } from "react-icons/sl";
import bcrypt from 'bcryptjs';
import toast_style from "./ToastStyle"
import supabase from "./ClientInstance";
import 'react-toastify/dist/ReactToastify.css';
import useUsername from "../hooks/useUsername";

export function CreateUser(): JSX.Element {
    const [email, setEmail] = useState<string>("");
    const [pass, setPass] = useState<string>("");
    const [confpass, setConfpass] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [passEqual, setPassEqual] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showPass, setShowPass] = useState<boolean>(false);
    const [showConfPass, setShowConfPass] = useState<boolean>(false);
    const [msg, setMsg] = useState<boolean>(false);

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => setUsername(event.target.value);
    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value);
    const handlePassChange = (event: React.ChangeEvent<HTMLInputElement>) => setPass(event.target.value);
    const handleConfPassChange = (event: React.ChangeEvent<HTMLInputElement>) => setConfpass(event.target.value);

    useEffect(() => {
        setPassEqual(pass !== "" && confpass !== "" && pass === confpass);
    }, [pass, confpass]);

    const handleClick = async () => {
        if (!passEqual) {
            toast.error("Passwords do not match! 😞");
            return;
        }
        if (pass.length < 6) {
            toast.error("The password should be a minimum of 6 characters long! 😞");
            return;
        }
        setIsLoading(true);

        const { data, error: errorOne } = await supabase.auth.signUp({
            email: email,
            password: pass,
        });

        if (errorOne) {
            toast.error(errorOne.message, toast_style);
            setIsLoading(false);
            return;
        } 

        if (data.user) {
            bcrypt.hash(pass, 10, async function (err: Error | null, hash: string) {
                if (err) {
                    toast.error(err.message);
                    setIsLoading(false);
                }
                const { error } = await supabase.from("user_information").insert({
                    userid: data.user?.id,
                    email: email,
                    hashpass: hash,
                    username: username,
                });

                if (error) {
                    toast.error(error.message);
                    setIsLoading(false);
                }

                setIsLoading(false);
                setMsg(true);
            });
        } else {
            toast.error("An error occurred, please try again later!");
            setIsLoading(false);
        }
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
                    <input
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                        onChange={handleUsernameChange}
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                    />
                    <input
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                        onChange={handleEmailChange}
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                    />
                    <div className="relative w-full">
                        <input
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500"
                            onChange={handlePassChange}
                            id="password"
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
                            onChange={handleConfPassChange}
                            id="confirmpassword"
                            type={showConfPass ? "text" : "password"}
                            placeholder="Confirm your password"
                            minLength={6}
                            maxLength={15}
                        />
                        <button className="absolute top-0 right-0 mt-2 mr-2" onClick={() => setShowConfPass(!showConfPass)}><SlEye size={25} className="mb-4 mr-2 ml-2" color="white" /></button>
                    </div>
                    <button
                        disabled={!username || !email || !pass || !confpass}
                        onClick={handleClick}
                        className={(!username || !email || !pass || !confpass) ? "w-full bg-slate-500 hover:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" : "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                    >
                        Sign Up
                    </button>
                    <Link to='/login'>
                        <button
                            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Log In Instead
                        </button>
                    </Link>
                </div>
                <div className="w-1/2 p-4 flex flex-col justify-center items-center text-center">
                    <img src="https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/assets/logo.png" alt="app logo" className="rounded-lg ml-5"/>
                    <h2 className="texl-xl">😍 The only music application you'll ever need for your late night vibing sessions 😍</h2>
                    <div className="border-white border-t-2"></div>
                    <p className="text-xl">🤘 Vibe On! 🤘</p>
                </div>
            </div>
            
        </div>
    )
}

export function AuthUser(): JSX.Element {
    const [email, setEmail] = useState<string>("")
    const [pass, setPass] = useState<string>("")
    const [verEmail, setVerEmail] = useState<string>("")
    const [username, setUsername] = useState<string>("")
    const [gotoprof, setGotoprof] = useState<boolean>(false)
    const [disabled, setDisabled] = useState<boolean>(true)
    const [showPass, setShowPass] = useState<boolean>(false)
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const navigate = useNavigate()

    const {data, error} = useUsername(verEmail)

    useEffect(() => {
        if (error) {
            toast.error(error, toast_style)
        } else if (data) {
            setUsername(data)
            setGotoprof(true)
        }
        setIsLoading(false)
    }, [data, error])

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value)
    }

    const handlePassChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPass(event.target.value)
    }

    useEffect(() => {
        if (email==="" || pass==="") {
            setDisabled(true)
        }
        else {
            setDisabled(false)
        }
    }, [email, pass])

    const handleClick = async () => {
        setIsLoading(true)

        const {data,error} = await supabase.auth.signInWithPassword({
            email: email,
            password: pass
        })

        if (error) {
            toast.error(error.message, toast_style)
            setIsLoading(false)
            return
        } 
        else {
            const {user,session} = data
            if (user && session) {
                if (user.role==="authenticated" && user.email) {
                    setVerEmail(user.email)
                } else {
                    toast.error("Please verify your account via email first!")
                    setIsLoading(false)
                }
            } else {
                toast.error("An error occurred, please try again later!", toast_style)
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        if (gotoprof && username) {
            navigate(`/${username}`);
        }
    // eslint-disable-next-line    
    }, [gotoprof, username]);

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
                    <input 
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                        onChange={handleEmailChange} 
                        id="email" 
                        type="email" 
                        placeholder="Enter your email address"
                    />
                    <div className="relative w-full">
                        <input 
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                            onChange={handlePassChange} 
                            id="password" 
                            type={showPass ? "text" : "password"}
                            placeholder="Enter your password"
                        />
                        <button 
                            className="absolute top-5 transform -translate-y-1/2 right-3" 
                            onClick={() => setShowPass(!showPass)}
                        >
                            <SlEye size={25} className="text-white"/>
                        </button>
                    </div>
                    <button 
                        onClick={handleClick}
                        disabled={disabled} 
                        className={disabled ? "w-full bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-not-allowed" : "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                    >
                        Log In
                    </button>
                    <Link to='/signup'>
                        <button 
                            className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Sign Up Instead
                        </button>
                    </Link>
                </div>
                <div className="w-1/2 p-4 flex flex-col items-center justify-center text-center">
                    <img src="https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/assets/logo.png" alt="Logo" className="rounded-lg" />
                    <h1 className="text-4xl font-bold mb-2">SynthureAI</h1>
                    <h2 className="texl-xl">😍 The only music application you'll ever need for your late night vibing sessions 😍</h2>
                    <p className="text-xl">🤘 Vibe On 😎 🤘</p>
                </div>
            </div>
            
        </div>
    )
}

