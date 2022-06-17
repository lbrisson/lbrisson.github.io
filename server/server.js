require('dotenv').config();
const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require("cors");
const bodyParser = require('body-parser');
const lyricsFinder = require("lyrics-finder");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/login', (req, res) => {
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        redirectUri: process.env.REDIRECT_URI,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
    })

    spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
        console.log('The token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        console.log('The refresh token is ' + data.body['refresh_token']);
        }).catch((err) => {
            console.log("error: \n" + err)
           // res.sendStatus(400)
        })
})

app.post("/refresh", (req, res) => {
        const refreshToken = req.body.refreshToken
        const spotifyApi = new SpotifyWebApi({
            redirectUri: process.env.REDIRECT_URI,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken
        })

        spotifyApi
        .refreshAccessToken()
        .then( (data) => {
            console.log('The access token has been refreshed!');
            res.json({
                accessToken: data.body.accessToken,
                expiresIn: data.body.expiresIn,
            })

            // console.log(data.body);
            // //Save the access token so that it's used in future calls
            // spotifyApi.setAccessToken(data.body['access_token']);
        })
        .catch(() => {
            res.sendStatus(400);
        })
})

app.get('/lyrics', async (req, res) => {
    const lyrics = await lyricsFinder(req.query.artist,  req.query.track) || "No lyrics found"

    res.json({lyrics})
})

app.listen(3001)