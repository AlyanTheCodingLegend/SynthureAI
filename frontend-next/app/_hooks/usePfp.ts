import { useEffect, useState } from "react"

function usePfp(username: string) {
    const [data, setData] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadPfp = async () => {
            const response = await fetch(`/api/getPfp/${username}`)
            const {data: dataP, error: errorP} = await response.json()
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