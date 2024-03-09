import {useState} from "react"

export default function InputBox () {
    const [firstname, setFirstname] = useState("John")
    const [lastname, setLastname] = useState("Doe")

    const handleClick = () => {
        setFirstname(firstname.toUpperCase())
        setLastname(lastname.toUpperCase())
    }

    const handleChange = (event) => {
        setFirstname(event.target.value)
    }

    const handleChange2 = (event) => {
        setLastname(event.target.value)
    }

    return (
        <>
        <div className="input-group">
            <span className="input-group-text">First and last name</span>
            <input type="text" aria-label="First name" className="form-control" value={firstname} onChange={handleChange}/>   
            <input type="text" aria-label="Last name" className="form-control" value={lastname} onChange={handleChange2}/>
            <button type="button" className="btn btn-primary" onClick={handleClick}>Uppercase</button>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => {setFirstname(""); setLastname("")}}>Clear</button>
        </>
    )
}