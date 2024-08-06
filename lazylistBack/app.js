import express from 'express'
import path from 'path'
import logger from 'morgan'
import cors from 'cors'
import queryString from 'query-string'
import cookieParser from 'cookie-parser'
import axios from 'axios'
import 'dotenv/config'

const client_id = process.env.client_id
const client_secret = process.env.client_secret
const redirect_uri = 'http://localhost:5173/'

const app = express();
app.use(cors())
app.use(logger('dev'))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));

app.post('/login', async (req, res) => {
    const headers = {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
        }
    };

    const data = {
        code: req.body.code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
    }

    const response = await axios.post('https://accounts.spotify.com/api/token', data, headers)

    res.json({
        accessToken: response.data
    })


})

app.post('/liked-songs', async (req, res) => {
    let response  = await axios.get('https://api.spotify.com/v1/me/tracks?limit=50', {
        headers: {
            Authorization: 'Bearer ' + req.body.access
        }
    })

    let likedSongs = response.data.items

    while (response.data.next !== null) {
        response = await axios.get(`${response.data.next}`, {
            headers: {
                Authorization: 'Bearer ' + req.body.access
            }
        })
        likedSongs = [...likedSongs, ...response.data.items]
    }
    res.json({
        songs: likedSongs
    })

})

app.post('/top-songs-year', async (req, res) => {
    let response = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50&offset=0', {
        headers: {
            Authorization: 'Bearer ' + req.body.access
        }
    })

    let likedSongs = response.data.items

    while (likedSongs.length < 500 && response.data.next !== null) {
        response = await axios.get(`${response.data.next}`, {
            headers: {
                Authorization: 'Bearer ' + req.body.access
            }
        })
        likedSongs = [...likedSongs, ...response.data.items]
    }
    
    res.json({
        songs: likedSongs
    })
})

app.post('/top-songs-6months', async (req, res) => {
    let response = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=50&offset=0', {
        headers: {
            Authorization: 'Bearer ' + req.body.access
        }
    })

    let likedSongs = response.data.items

    while (likedSongs.length < 250 && response.data.next !== null) {
        response = await axios.get(`${response.data.next}`, {
            headers: {
                Authorization: 'Bearer ' + req.body.access
            }
        })
        likedSongs = [...likedSongs, ...response.data.items]
    }
    res.json({
        songs: likedSongs
    })
    
})

app.post('/top-songs-1month', async (req, res) => {
    let response = await axios.get('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50&offset=0', {
        headers: {
            Authorization: 'Bearer ' + req.body.access
        }
    })

    let likedSongs = response.data.items

    while (likedSongs.length < 100 && response.data.next !== null) {
        response = await axios.get(`${response.data.next}`, {
            headers: {
                Authorization: 'Bearer ' + req.body.access
            }
        })
        likedSongs = [...likedSongs, ...response.data.items]
    }
    res.json({
        songs: likedSongs
    })
})

app.post('/user-id' , async (req, res) => {
    let response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
            Authorization: 'Bearer ' + req.body.access
        }
    })

    res.json({
        id: response.data.id
    })
})

app.post('/create-playlist', async (req, res) => {

    let response = await axios.post(`https://api.spotify.com/v1/users/${req.body.userId}/playlists`, {
        name: req.body.playlistName,
        description: 'Playlist created by LazyPlaylist',
        public: false

    }, {
        headers: {
            Authorization: 'Bearer ' + req.body.access,
            'Content-Type': 'application/json'
        }
    })

    res.json({
        playlistId: response.data.id
    })
})

app.post('/filter-playlist', async (req, res) => {
    let songAnalytics = []
    let filteredSongs = []

    console.log(req.body.id.length)
    console.log(req.body)

    // Returns each tracks audio features for playlist recieved from frontend in chunks of 100 (Spotify API limit)
    for (let i = 0; i < req.body.id.length; i+=100) {
        let upperBound = i + 100
        let search = []
        for (let j = i; j < upperBound; j++) {
            if (req.body.id[j] !== undefined){
                search = [...search, req.body.id[j]]
            }
        }
        let formatSearch = search.join(',')
        let response = await axios.get(`https://api.spotify.com/v1/audio-features?ids=${formatSearch}`, {
            headers: {
                Authorization: 'Bearer ' + req.body.access
            }
        })
        songAnalytics=[...songAnalytics, ...response.data.audio_features]
    }

    //filters playlist based on user inputted filter values
    songAnalytics.forEach(song => {
        if (song.valence <= req.body.valence[1] && song.valence >= req.body.valence[0] && song.energy <= req.body.energy[1] && song.energy >= req.body.energy[0] && song.danceability <= req.body.danceability[1] && song.danceability >= req.body.danceability[0]) {
            filteredSongs = [...filteredSongs, song.id]
        }
    })
    
    res.json({
        filteredSongs: filteredSongs
    })

})

app.post('/add-songs', async (req, res) => {
    console.log(req.body)
    for ( let i = 0; i < req.body.uris.length; i+=100) {
        let upperBound = i + 100
        let search = []
        for (let j = i; j < upperBound; j++) {
            if (req.body.uris[j] !== undefined){
                search = [...search, req.body.uris[j]]
            }
        }
        let response = await axios.post(`https://api.spotify.com/v1/playlists/${req.body.playlistId}/tracks`, {
            uris: search
        }, {
            headers: {
                Authorization: 'Bearer ' + req.body.access,
                'Content-Type': 'application/json'
            }
        })
    }

})

app.listen(3000, () => console.log("app listening on port 3000!"))