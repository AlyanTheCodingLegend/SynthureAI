import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.post('/song_id', (req, res) => {
    const {song_id} = req.body
    console.log(song_id)
    res.status(200).send("Song created successfully!")
})

const PORT = 5000

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})