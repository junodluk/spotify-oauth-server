# spotify-oauth-server - A Spotify Token Exchange Server

Project created as part of a challenge for HiPlatform.
This server uses node and express to exchange and refresh access tokens via the Spotify's Web API.

This project was configured for Heroku hosting.

Authored by **Alcione de Lucca Júnior** <junior.dluk@gmail.com>

**Summary**
- [Setting up](#setting-up)
- [Deploying on Heroku](#deploying-on-heroku)
- [Running Locally](#running-locally)
- [Authentication Server](#authentication-server)

## Setting up
1. `git clone https://github.com/junodluk/spotify-oauth-server.git`;
2. Install **yarn** by running `npm i -g yarn` if you don't have it;
3. Run `yarn` to install dependencies;

## Deploying on Heroku
1. Create your app on Heroku and link with your repository;
    - For more info access the Heroku deply [documentation](https://devcenter.heroku.com/categories/deployment);
    - CAREFUL: Deploy and access are free until you reach their limit, after that the server will shut down;
    - I recommend using a `newrelic` license to prevent your server from sleeping. Don't forget to set the environment variable if you do;
2. Set CLIENT_ID, CLIENT_SECRET and CLIENT_CALLBACK_URL variables in your environment using the Heroku CLI command `heroku config:set ENV_VAR=value`;
    - Your client ID and Secret can be found in your app settings in Spotify Developer;

## Running Locally
1. Start the server by running `yarn start`;
2. Access url `http://localhost:4343/`;
3. Set CLIENT_ID, CLIENT_SECRET, and CLIENT_CALLBACK_URL variables in your local environment;

## Authentication Server
- [Online on Heroku](https://spotify-oauth-server.herokuapp.com/)
