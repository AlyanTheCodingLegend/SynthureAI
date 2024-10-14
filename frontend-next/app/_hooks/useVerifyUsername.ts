import { useEffect, useState } from "react"

type useVerifyUsernameReturn = {
    data : UserInformation | null,
    error: string | null
}

type UserInformation = {
    userid: string,
    verifusername: string
}    

function useVerifyUsername(username: string | undefined) : useVerifyUsernameReturn {
    const [data, setData] = useState<UserInformation | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function verifyUsername() {
            const tempUsername = username || ""
            if (tempUsername!=="") {
                const response = await fetch(`/api/getUserInformation/${tempUsername}`)
                const {data: dataP, error: errorP} = await response.json()
                if (errorP) {
                    setError(errorP.message)
                } else {
                    if (dataP.length===0) {
                        setError("User not found")
                    } else {
                        setData({userid: dataP[0].userid, verifusername: tempUsername})
                    }
                }
            }
        }

        verifyUsername()
    }, [username])        

    return {data, error}
}

export default useVerifyUsername