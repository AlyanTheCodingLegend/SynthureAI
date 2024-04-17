import { AuthUser } from "./UserAuthModel"
import { useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import toast_style from "./ToastStyle"
import supabase from "./ClientInstance"
import 'react-toastify/dist/ReactToastify.css'
import SongUploadModel from "./SongUploadModel"

export function ProfilePage({ username, userAuth, sessionAuth }) {
    const [login, setLogin] = useState(false)
    const [upload, setUpload] = useState(false)

    const handleClick = async () => {
        const {error} = await supabase.auth.signOut()
        if (error) {
          toast.error(error.message, toast_style)
        }
        setLogin(true)
    }

    const handleClickTwo = () => {
      setUpload(true)
    }

    if (login) {
        return (
            <AuthUser/>
        )
    }

    if (upload) {
      return (
        <SongUploadModel username={username} userAuth={userAuth} sessionAuth={sessionAuth}/>
      )
    }

    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome, {username}</h2>
          <div className="flex justify-between items-center mb-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Home
            </button>
            <button onClick={handleClickTwo} className="bg-purple-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Upload Songs
            </button>
            <button onClick={handleClick} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Sign Out
            </button>
          </div>
          <div className="border-t border-gray-700 mt-4 pt-4">
            {/* Add additional profile information here */}
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={5000}  hideProgressBar={false} closeOnClick pauseOnHover draggable theme='dark'/>
      </div>
    );
}
  