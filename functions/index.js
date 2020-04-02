const functions = require('firebase-functions');
const express = require('express');

const auth = require('./util/auth');
const posts = require('./handlers/scream');
const userHandler = require('./handlers/user');

const app = express();

app.get('/screams', posts.getAllScreams);
app.post('/scream', auth, posts.addScream);
app.get('/scream/:screamId', posts.getScream);
app.delete('/scream/:screamId',auth, posts.deleteScream);
app.post('/scream/:screamId/comment', auth, posts.commentOnScream);
app.get('/scream/:screamId/like', auth, posts.likeScream)
app.get('/scream/:screamId/unlike', auth, posts.unlikeScream)

app.post('/signup', userHandler.signup);
app.post('/login', userHandler.signIn);
app.post('/imageUpload', auth, userHandler.uploadImage);
app.post('/user', auth, userHandler.addUserDetails);
app.get('/user', auth, userHandler.getAuthenticatedUser);

//https://baseurl.com/api
exports.api = functions.https.onRequest(app);
