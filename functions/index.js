const functions = require('firebase-functions');
const express = require('express');

const auth = require('./util/auth');
const { getAllScreams, addScream } = require('./handlers/scream');
const { signup, signIn } = require('./handlers/user');

const app = express();

app.get('/screams', getAllScreams);

app.post('/scream', auth, addScream);

app.post('/signup', signup);

app.post('/login', signIn);

//https://baseurl.com/api
exports.api = functions.https.onRequest(app);