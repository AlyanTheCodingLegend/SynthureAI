import { useEffect, useState } from "react"
import { type Model } from "../_types/types"

function useModels() {
    const [models, setModels] = useState<Model[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchModels = async () => {
            try {
                const response = await fetch(`/api/getModels`)
                if (!response.ok) {
                    throw new Error("Failed to fetch models")
                }
                const data = await response.json()
                setModels(data)
            } catch (err) {
                setError((err as Error).message)
            }
        }

        fetchModels()
    }, [])

    return {models, error}
}

export default useModels