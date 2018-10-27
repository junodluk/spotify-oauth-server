/**
 * If we have a new relic license key, we'll use it.
 * This is useful for keeping Heroku instances online.
 */
if (!!process.env.NEW_RELIC_LICENSE_KEY) {
    require('./app/newrelic');
} else {
    console.log('### NO NEW_RELIC_LICENSE_KEY FOUND, SERVER WILL SLEEP AFTER 30min')
}

if (
    !process.env.CLIENT_ID ||
    !process.env.CLIENT_SECRET ||
    !process.env.CLIENT_CALLBACK_URL
) {
    console.log(
        '[' + new Date().toISOString() + ']',
        'Environment variables not set up correctly. Please set CLIENT_ID,' +
        'CLIENT_SECRET and CLIENT_CALLBACK_URL in the environment this app is running in.' +
        'For help, see README'
    );

    process.exit(1);
}

var express = require('express');
var request = require('request');
var encrpytion = require('./app/encryption.js');
var bodyParser = require('body-parser');
var dotenv = require('dotenv');
var cors = require('cors');
var http = require('http');

var app = express();
dotenv.load();

/**
 * Set these variables in your local environment.
 * Your client ID and secret can be found in your app
 * settings in Spotify Developer.
 * heroku config:set ENV_VAR=value
 */
const API_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_CALLBACK_URL = process.env.CLIENT_CALLBACK_URL;
const AUTH_STRING = new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64');
const AUTH_HEADER = 'Basic ' + AUTH_STRING;

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(cors({
    origin: true,
    credentials: true
}));

const spotifyRequest = params => {
    return new Promise((resolve, reject) => {
        request.post(API_URL, {
            form: params,
            headers: {
                'Authorization': AUTH_HEADER
            },
            json: true
        }, (err, resp) => err ? reject(err) : resolve(resp));
    })
        .then(resp => {
            if (resp.statusCode != 200) {
                return Promise.reject({
                    statusCode: resp.statusCode,
                    body: resp.body
                });
            }
            return Promise.resolve(resp.body);
        })
        .catch(err => {
            return Promise.reject({
                statusCode: 500,
                body: JSON.stringify({})
            });
        });
};

/**
 * Exchange endpoint
 *
 * Uses an authentication code on req.body to request access and
 * refresh tokens. Refresh token is encrypted for safe storage.
 */
app.post('/exchange', (req, res) => {

    const params = req.body;
    if (!params.code) {
        return res.json({
            'error': 'Parameter missing'
        });
    }

    spotifyRequest({
        grant_type: 'authorization_code',
        redirect_uri: CLIENT_CALLBACK_URL,
        code: params.code
    })
        .then(session => {
            let result = {
                'access_token': session.access_token,
                'expires_in': session.expires_in,
                'refresh_token': encrpytion.encrypt(session.refresh_token)
            };
            return res.send(result);
        })
        .catch(response => {
            return res.json(response);
        });
});

/**
 * Refresh endpoint
 *
 * Uses the encrypted token on request body to get a new access token.
 * If spotify returns a new refresh token, this is encrypted and sent
 * to the client, too.
 */
app.post('/refresh', (req, res) => {
    const params = req.body;
    if (!params.refresh_token) {
        return res.status(400).json({
            "error": "Parameter missing"
        });
    }

    spotifyRequest({
        grant_type: "refresh_token",
        refresh_token: encrpytion.decrypt(params.refresh_token)
    })
        .then(session => {
            return res.status(200).send({
                "access_token": session.access_token,
                "expires_in": session.expires_in
            });
        })
        .catch(response => {
            return res.json(response);
        });
});

/**
 * Present a nice message to those who are trying to find a default
 * endpoint for the service.
 */
app.get('/', function (req, res, next) {
    return res.send('Hello world! ' + AUTH_HEADER);
});

/**
 * Logging output to the console in a format which can be read
 * by log viewers and the like. Runs after every request which
 * calls next. Typically ends a chain.
 *
 * This is turned on by default, to turn it off, set ACCESS_LOG=off
 * in the environment variables.
 */
app.use(function (req, res) {
    if (!!process.env.ACCESS_LOG && process.env.ACCESS_LOG == 'off') {
        return;
    }

    var ip = req.headers["x-forwarded-for"] || req.ip;

    var accessParts = [
        req.method.toUpperCase(),
        req.hostname,
        req.path,
        req.protocol.toUpperCase(),
    ];

    var parts = [
        '[' + new Date().toISOString() + ']',
        '[Client: ' + ip + ']',
        '"' + accessParts.join(' ') + '"',
        res.statusCode,
        '"' + req.headers["user-agent"] + '"',
    ];

    console.log(parts.join(' '));
});

var server = http.createServer(app);

server.listen(process.env.PORT || 4343, function (err) {
    console.log('[' + new Date().toISOString() + ']', 'Spotify token exchange app listening on port ', process.env.PORT || 4343);
});