import { AuthUser } from "./UserAuthModel"
import { useState } from "react"
import { toast } from "react-toastify";
import toast_style from "./ToastStyle";
import supabase from "./ClientInstance"

export function ProfilePage({ username }) {
    const [login, setLogin] = useState(false)

    const handleClick = async () => {
        const {error} = await supabase.auth.signOut()
        if (error) {
          toast(error.message, toast_style)
        }
        setLogin(true)
    }

    if (login) {
        return (
            <AuthUser/>
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
            <button onClick={handleClick} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Sign Out
            </button>
          </div>
          <div className="border-t border-gray-700 mt-4 pt-4">
            {/* Add additional profile information here */}
          </div>
        </div>
      </div>
    );
}
  