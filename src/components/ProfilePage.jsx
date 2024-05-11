import { AuthUser } from "./UserAuthModel"
import { useState } from "react"
import { ToastContainer, toast } from "react-toastify"
import toast_style from "./ToastStyle"
import supabase from "./ClientInstance"
import 'react-toastify/dist/ReactToastify.css'
import SongUploadModel from "./SongUploadModel"
import PlaylistModel from "./PlaylistModel"
import bcrypt from 'bcryptjs'

export function ProfilePage({ username, userID }) {
    const [login, setLogin] = useState(false)
    const [upload, setUpload] = useState(false)
    const [createpl, setCreatepl] = useState(false)
    const [pfp, setPfp] = useState(null)
    const [popup, setPopup] = useState(false)
    const [pass, setPass] = useState('')

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

    const handleClickThree = () => {
      setCreatepl(true)
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
      bcrypt.hash(pass, 10, async function(err, hash) {
          if (err) {
              toast.error(err.message, toast_style);
          } else {
              const { data, error } = await supabase
                  .from('user_information')
                  .select('email, hashpass')
                  .eq('username', username);
                  
              if (error) {
                  toast.error(error.message, toast_style);
              } else {
                  if (data.length !== 0) {
                      const storedHash = data[0].hashpass;
  
                      // Compare hashed passwords
                      bcrypt.compare(pass, storedHash, async function(compareErr, result) {
                          if (compareErr) {
                              toast.error(compareErr.message, toast_style);
                          } else {
                              if (result) {
                                  const { error: deleteError } = await supabase
                                      .from('user_information')
                                      .delete()
                                      .eq('username', username);
  
                                  if (deleteError) {
                                      toast.error(deleteError.message, toast_style);
                                  } else {
                                    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userID);
                                    if (deleteUserError) {
                                        toast.error(deleteUserError.message, toast_style);
                                    } else {
                                        toast.success('Account has been successfully deleted', toast_style);
                                        setLogin(true);
                                    }
                                  }
                              } else {
                                  toast.error('Wrong password!', toast_style);
                              }
                          }
                      });
                  } else {
                      toast.error('User not found', toast_style);
                  }
              }
          }
      });
  };
  

    if (login) {
        return (
            <AuthUser/>
        )
    }

    if (createpl) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-8 rounded-lg relative">
            <PlaylistModel username={username} onClose={()=>{setCreatepl(false)}}/>
          </div>
        </div>
      )
    }

    if (upload) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white p-8 rounded-lg relative">
            <SongUploadModel username={username} onClose={()=>{setUpload(false)}}/>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center">
        {/* <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
            <div className="bg-white p-8 rounded-lg relative">
                <input type="file" accept="image/*" onChange={handleProfilePicChange} />
                <button onClick={handleSubmit}>Save</button>
            </div>
        </div> */}
        {popup && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
              <div className="text-black p-8 rounded-lg relative">
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
                  <button onClick={handlePassSubmit}>Submit</button>
                  <button onClick={() => setPopup(false)}>Cancel</button>
              </div>
          </div>
        )}
        <div className="max-w-md w-full bg-blue-600 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Welcome, {username}</h2>
          <div className="flex justify-between items-center mb-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Home
            </button>
            <button onClick={handleClickTwo} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Upload Songs
            </button>
            <button onClick={handleClickThree} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
              Create Playlist
            </button>
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
  