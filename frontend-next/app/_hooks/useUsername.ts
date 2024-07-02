import { useEffect, useState } from "react"
import supabase from "../_components/ClientInstance"

function useUsername(email: string) {
    const [data, setData] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const getUsername = async () => {
            const {data: dataP, error: errorP} = await supabase.from('user_information').select('username').eq('email',email)
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