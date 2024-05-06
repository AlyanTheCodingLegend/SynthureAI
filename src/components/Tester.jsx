import supabase from "./ClientInstance"
import toast_style from './ToastStyle';

export default function Tester() {
    
    const handleClick = async () => {
        // const {data, error} = await supabase.from('image_information').select('*')
        // console.log(error)
        // const uploaded=data[0].uploaded_at
        // console.log(uploaded)
        // const specificDate=new Date().getMonth()
        // const thisDate=new Date(uploaded).getMonth()
        // console.log(specificDate)
        // console.log(thisDate)

        const song_id=""
        try {
            const {data, error} = await supabase.from('playcount_information').select("*").eq('song_id',song_id)
            if (error) throw error
            if (data.length===0) { // no row
                const {error: errorTwo} = await supabase.from('playcount_information').insert({song_id: song_id, dailycount: 1, monthlycount: 1, alltimecount: 1})

                if (errorTwo) throw errorTwo
            } else { // song has row
                const {error: errorThree} = await supabase.from('playcount_information').update({dailycount: data[0].dailycount+1, monthlycount: data[0].monthlycount+1, alltimecount: data[0].alltimecount+1}).eq('song_id',song_id)

                if (errorThree) throw errorThree
            }
        } catch (error) {
            toast.error(error.message, toast_style)
        }

    }

    return (
        <div>
            <button onClick={handleClick}>Press Me</button>
        </div>
    )
}