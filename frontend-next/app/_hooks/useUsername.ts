import { useEffect, useState } from "react"

function useUsername(email: string) {
    const [data, setData] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const getUsername = async () => {
            const response = await fetch(`/api/getUsername/${email}`)
            const {data: dataP, error: errorP} = await response.json()
            if (errorP || dataP.length===0) {
                setError("User not found")
            }
            else if (dataP.length!==0) {
                setData(dataP[0].username)
            }
        }

        if (email) getUsername()
    }, [email])

    return {data, error}
}

export default useUsername