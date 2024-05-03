import supabase from "./ClientInstance"

export default function Tester() {
    
    const handleClick = async () => {
        const {data, error} = await supabase.from('artist_information').select("songs_released").eq('name','Arijit Sing')
        console.log(data[0].songs_released[0])

    }

    return (
        <div>
            <button onClick={handleClick}>Press Me</button>
        </div>
    )
}