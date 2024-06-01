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
    const [popup, setPopup] = useState(false)
    const [showPass, setShowPass]= useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [signOut, setSignOut] = useState(false)
    const [pass, setPass] = useState('')
    const [userID, setUserID] = useState(null)
    const [pfp, setPfp] = useState(null)
    const [playlists, setPlaylists] = useState(null)

    const navigate = useNavigate()

    const { username } = useParams()

    // useEffect(() => {
    //   if (login) {
    //     navigate('/login')
    //   }  
    // }, [login])  

    const handleClick = async () => {
        setSignOut(true)
        const {error} = await supabase.auth.signOut()
        if (error) {
          toast.error(error.message, toast_style)
        }
        navigate('/login')
    }

    const handleProfilePicChange = (event) => {
      if (event.target.files) {
        setPfp(event.target.files[0])
      }  
    }

    useEffect(() => {
      const loadPlaylists = async () => {
        let userplaylists=[]
        const {data, error} = await supabase.from('playlist_information').select("playlist_name").eq('created_by', username)
        if (error) {
          toast.error("Error loading playlists!", toast_style)
        } else {
          if (data.length !== 0) {
            for (let i = 0; i < data.length; i++) {
              userplaylists.push(data[i].playlist_name)
            }
            setPlaylists(userplaylists)
          }
        }
      }

      loadPlaylists()
    }, [])  

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
                                setSignOut(true)
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
      <div className="min-h-screen min-w-screen bg-black text-white flex flex-col justify-center items-center">
            {popup && (
                <div className="fixed inset-0 flex items-center justify-center bg-blue-600 bg-opacity-75 z-50">
                    <div className="text-black p-8 rounded-lg relative w-11/12 md:w-7/12 bg-blue-900">
                        <div className="relative w-full mb-4">
                            <input
                                placeholder="Enter your password to confirm account deletion"
                                type={showPass ? "text" : "password"}
                                value={pass}
                                onChange={(e) => setPass(e.target.value)}
                                className="text-white w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none"
                            />
                            <button
                                className="absolute top-1/2 transform -translate-y-1/2 right-3"
                                onClick={() => setShowPass(!showPass)}
                            >
                                <SlEye size={25} color="white" />
                            </button>
                        </div>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={handlePassSubmit}
                                className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-600"
                            >
                                Submit
                            </button>
                            <button
                                onClick={() => { setPopup(false); setPass(""); setShowPass(false); }}
                                className="bg-gray-500 text-white font-bold py-2 px-4 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <div className="w-full max-w-4xl bg-blue-600 rounded-lg shadow-lg p-8 mx-4 my-8">
                <h2 className="text-3xl font-bold mb-4">Welcome, {username} 😎</h2>
                <div className="flex flex-col md:flex-row items-center md:items-start mb-4">
                    <div className="relative w-24 h-24 overflow-hidden rounded-full bg-gray-200 mb-4 md:mb-0 md:mr-4">
                        <input type="file" accept="image/*" onChange={handleProfilePicChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <img src={pfp ? pfp : "https://uddenmrxulkqkllfwxlp.supabase.co/storage/v1/object/public/images/assets/defaultpfp.jpg"} alt="Profile" className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                    <button onClick={handleSubmit} disabled={!pfp} className="rounded-full bg-blue-950 w-24 h-10 text-center text-xl text-white hover:bg-blue-300 disabled:bg-gray-500">Save</button>
                </div>
                <div className="flex justify-between items-center mb-4">
                    <Link to={`/${username}`}>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                            Home
                        </button>
                    </Link>
                    <button onClick={handleClick} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Sign Out
                    </button>
                    <button onClick={handleClickFour} className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                        Delete Account
                    </button>
                </div>
                <div className="border-t-4 border-white mt-4 pt-4">
                    <h3 className="text-2xl font-bold mb-2">Top Playlists</h3>
                    <div className="flex flex-col space-y-2">
                        {playlists && playlists.length !== 0 ? (
                            playlists.map((playlist, index) => (
                                <div key={index} className="flex items-center justify-between bg-blue-700 rounded-lg p-2">
                                    <div className="text-lg">{playlist}</div>
                                    <div className="text-xl">🎵</div>
                                </div>
                            ))
                        ) : (
                            <div className="text-lg">No playlists to show</div>
                        )}
                    </div>
                </div>
                <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} closeOnClick pauseOnHover draggable theme="dark" />
            </div>
        </div>
    );
}
  