import { useEffect, useState } from "react"
import supabase from "../_components/ClientInstance"

function usePfp(username: string) {
    const [data, setData] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadPfp = async () => {
            const {data: dataP, error: errorP} = await supabase.from('user_information').select('pfp_path').eq('username', username)
            if (errorP) {
                setError(errorP.message)
            } else {
                if (dataP.length !== 0) {
                    setData(dataP[0].pfp_path)
                }
            } 
        }
  
        loadPfp()
      }, [username])

      return {data, error}
}

export default usePfp