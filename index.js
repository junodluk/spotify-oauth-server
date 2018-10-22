var
  cors = require('cors'),
  http = require('http'),
  express = require('express'),
  dotenv = require('dotenv'),
  bodyParser = require('body-parser'),
  request = require('request'),
  CryptoJS = require('crypto-js');

var app = express();
dotenv.load();

const API_URL = "https://accounts.spotify.com/api/token";
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const CLIENT_CALLBACK_URL = process.env.CLIENT_CALLBACK_URL;
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

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
        "Authorization": "Basic " + new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString('base64')
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