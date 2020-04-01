const functions = require('firebase-functions');
const express = require('express');

const auth = require('./util/auth');
const posts = require('./handlers/scream');
const userHandler = require('./handlers/user');

const app = express();

app.get('/screams', posts.getAllScreams);
app.post('/scream', auth, posts.addScream);

app.post('/signup', userHandler.signup);
app.post('/login', userHandler.signIn);
app.post('/imageUpload', auth, userHandler.uploadImage);

//https://baseurl.com/api
exports.api = functions.https.onRequest(app);
