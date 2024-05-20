import { useEffect, useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import toast_style from "./ToastStyle"
import supabase from "./ClientInstance"
import 'react-toastify/dist/ReactToastify.css'
import bcrypt from 'bcryptjs'
import { Link, useNavigate, useParams } from "react-router-dom"
import { SlEye } from "react-icons/sl"
import { BounceLoader } from "react-spinners"

export function ProfilePage() {
    const [login, setLogin] = useState(false)
    const [popup, setPopup] = useState(false)
    const [popupTwo, setPopupTwo] = useState(false)
    const [showPass, setShowPass]= useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [pass, setPass] = useState('')
    const [userID, setUserID] = useState(null)
    const [pfp, setPfp] = useState(null)

    const navigate = useNavigate()

    const { username } = useParams()

    useEffect(() => {
      if (login) {
        navigate('/login')
      }  
    }, [login])  

    const handleClick = async () => {
        const {error} = await supabase.auth.signOut()
        if (error) {
          toast.error(error.message, toast_style)
        }
        setLogin(true)
    }

    const handleProfilePicChange = (event) => {
      if (event.target.files) {
        setPfp(event.target.files[0])
      }  
    }

    const handleSubmit = async () => {
      const {error} = await supabase.storage.from('images').upload(`${username}/pfp.${pfp.type.replace('image/', '')}`, pfp, { cacheControl: '3600', upsert: true, contentType: pfp.type})
      if (error) {
        toast.error(error.message, toast_style)
      } else {
        const {error: errorOne} = await supabase.from('user_information').update({pfp_path: `https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/${username}/pfp.${pfp.type.replace('image/','')}`}).eq('username', username)
        if (errorOne) {
          toast.error(errorOne.message, toast_style)
        } else {
          toast.success('Profile Photo successfully updated!', toast_style)
        }
      }
    }

    const handleClickFour = async () => {
      setPopup(true)
    }

    const handlePassSubmit = async () => {
      setIsLoading(true)
      
      const { data, error } = await supabase
          .from('user_information')
          .select('userid, email, hashpass')
          .eq('username', username);
          
      if (error) {
        setIsLoading(false);
        toast.error(error.message, toast_style);
      } else {
          if (data.length !== 0) {
              setUserID(data[0].userid);
              const storedHash = data[0].hashpass;

              // Compare hashed passwords
              bcrypt.compare(pass, storedHash, async function(compareErr, result) {
                  if (compareErr) {
                    setIsLoading(false);
                    toast.error(compareErr.message, toast_style);
                  } else {
                      if (result) {
                          const { error: deleteError } = await supabase
                              .from('user_information')
                              .delete()
                              .eq('username', username);

                          if (deleteError) {
                            setIsLoading(false);
                            toast.error(deleteError.message, toast_style);
                          } else {
                            const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userID);
                            if (deleteUserError) {
                              setIsLoading(false);
                              toast.error(deleteUserError.message, toast_style);
                            } else {
                                toast.success('Account has been successfully deleted', toast_style);
                                setLogin(true);
                            }
                          }
                      } else {
                        setIsLoading(false);
                        toast.error('Wrong password!', toast_style);
                      }
                  }
              });
          } else {
            setIsLoading(false);
            toast.error('User not found', toast_style);
          }
      }
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
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        {popup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="text-black p-8 rounded-lg relative w-7/12">
                  <input placeholder="Enter your password to confirm account deletion" type={showPass ? "text" : "password"}  value={pass} onChange={(e) => setPass(e.target.value)} className="text-white w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-4 focus:outline-none z-30"/>
                  <button className="absolute top-0 right-0 mt-2 mr-2" onClick={() => setShowPass(!showPass)}><SlEye size={25} className="mb-4 mr-2 ml-2" color="white"/></button>
                  <button onClick={handlePassSubmit} className="bg-red-400">Submit</button>
                  <button onClick={() => {setPopup(false); setPass(""); setShowPass(false)}}>Cancel</button>
              </div>
          </div>
        )}
        <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome, {username} 😎</h2>
          <div className="relative w-12 h-12 overflow-hidden rounded-full bg-gray-200">
            <input type="file" accept="image/*" onChange={handleProfilePicChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"/>
            <img src={pfp ? pfp : "https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/assets/defaultpfp.jpg"} alt="placeholder pfp" className={pfp ? "absolute inset-0 w-full h-full object-cover z-20" : "absolute inset-0 w-full h-full object-cover z-0"}/>
          </div>
          <button onClick={handleSubmit} disabled={!pfp} className="rounded-full bg-blue-950 w-16 h-5 text-center mt-1 text-xl hover:bg-blue-300">Save</button>
          <div className="flex justify-between items-center mb-4">
            <Link to={`/${username}`}>
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Home
              </button>
            </Link>
            <Link to={`/songuploader/${username}`}>
              <button className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Upload Songs
              </button>
            </Link>
            <Link to={`/playlists/${username}`}>
              <button className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                Create Playlist
              </button>
            </Link>
            <button onClick={handleClick} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Sign Out
            </button>
            <button onClick={handleClickFour} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Delete Account
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
  