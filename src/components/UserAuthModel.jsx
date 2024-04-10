import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ProfilePage } from "./ProfilePage";
import bcrypt from 'bcryptjs';
import toast_style from "./ToastStyle"
import supabase from "./ClientInstance";
import 'react-toastify/dist/ReactToastify.css';

export function CreateUser() {

    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [confpass, setConfpass] = useState("")
    const [passEqual, setPassEqual] = useState(false)
    const [username, setUsername] = useState("")
    const [login, setLogin] = useState(false)

    const handleUsernameChange = (event) => {
        setUsername(event.target.value)
    }

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handlePassChange = (event) => {
        setPass(event.target.value)
    }

    const handleConfPassChange = (event) => {
        setConfpass(event.target.value)
    }

    useEffect(()=> {
        if (pass!=="" && confpass!=="") {
            if (pass===confpass) {
                setPassEqual(true)
            }
            else {
                setPassEqual(false)
            }
        } else {
            setPassEqual(false)
        }    
    }, [pass, confpass])



    const handleClick = async () => {
        const {data, errorOne} = await supabase.auth.signUp({
            email: email,
            password: pass
        })

        if (errorOne) {
            toast.error(errorOne.message, toast_style)
            return;
        }

        if (data) {
        
            bcrypt.hash(pass, 10, async function(err, hash) {
                if (err) {
                toast.error(err.message, toast_style);
                return;
                }
                const {error} = await supabase.from("user_information").insert({email: email, hashpass: hash, username: username})
                if (error) {
                    toast.error(error.message, toast_style);
                    return;
                }
            })

            return (
                <div className="min-h-screen bg-black text-white flex justify-center items-center">
                    <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
                        {'A confirmation link has been sent to your email, please head to your email to confirm your registration :) '}
                    </div>
                </div>
            )
        }    
    }

    if (login) {
        return (
            <AuthUser/>
        )
    }
    
    return (
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
            <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
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
                <input 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                    onChange={handlePassChange} 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                    minLength={6}
                    maxLength={15}
                />
                {(!passEqual && pass!=="" && confpass!=="") && (<div className="-mt-3">{"Passwords do not match! :("}</div>)}
                <input 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                    onChange={handleConfPassChange} 
                    id="confirmpassword" 
                    type="password" 
                    placeholder="Re-enter the password to confirm your registration"
                />
                <button 
                    disabled={!passEqual || !username || !email || !pass || !confpass} 
                    onClick={handleClick} 
                    className={(!passEqual || !username || !email || !pass || !confpass)? "w-full bg-slate-500 hover:cursor-not-allowed text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline":"w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                >
                    Sign Up
                </button>
                <button
                    
                    onClick={()=>setLogin(true)}
                    className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Log In Instead
                </button>
            </div>
            <ToastContainer position="top-right" autoClose={5000}  hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
        </div>
    )
}

export function AuthUser() {
    const [email, setEmail] = useState("")
    const [pass, setPass] = useState("")
    const [create, setCreate] = useState(false)
    const [gotoprof, setGotoprof] = useState(false)
    const [username, setUsername] = useState("")
    const [verEmail, setVerEmail] = useState("")
    const [disabled, setDisabled] = useState(true)

    const handleEmailChange = (event) => {
        setEmail(event.target.value)
    }

    const handlePassChange = (event) => {
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
        const {data,error} = await supabase.auth.signInWithPassword({
            email: email,
            password: pass
        })
        if (data) {
            const {user,session} = data
            if (user && session && user.role==="authenticated") {
                setVerEmail(user.email)
                getUsername()
            }
        }
        else if (error) {
            toast.error(error.message, toast_style)
        }
    }

    const getUsername = async () => {
        const {data,error} = await supabase.from('user_information').select('username').eq('email',verEmail)
        if (data[0] && data) {
            setUsername(data[0].username)
            setGotoprof(true)
        }
        if (error) {
            toast.error(error.message, toast_style)
        }
    }

    if (gotoprof) {
        return (
            <ProfilePage username={username}/>
        )
    }

    if (create) {
        return (
            <CreateUser/>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white flex justify-center items-center">
            <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold mb-4">Log In</h2>
                <input 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                    onChange={handleEmailChange} 
                    id="email" 
                    type="email" 
                    placeholder="Enter your email address"
                />
                <input 
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 text-white focus:outline-none focus:border-blue-500" 
                    onChange={handlePassChange} 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password"
                />
                <button 
                    onClick={handleClick}
                    disabled={disabled} 
                    className={disabled ? "w-full bg-slate-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline cursor-not-allowed" : "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"}
                >
                    Log In
                </button>
                <button 
                    onClick={()=>setCreate(true)} 
                    className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Sign Up Instead
                </button>
            </div>
            <ToastContainer position="top-right" autoClose={5000}  hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
        </div>
    )
}
