const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const firebase = require('firebase');

const app = express();
var serviceAccount = require('./socialapp-d5975-9bc2ed23b4ff.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://socialapp-d5975.firebaseio.com'
});
const db = admin.firestore();

const firebaseConfig = {
  apiKey: 'AIzaSyBdvligNYUknXGYbee-uI9qNSjmHQynBqA',
  authDomain: 'socialapp-d5975.firebaseapp.com',
  databaseURL: 'https://socialapp-d5975.firebaseio.com',
  projectId: 'socialapp-d5975',
  storageBucket: 'socialapp-d5975.appspot.com',
  messagingSenderId: '325340725354',
  appId: '1:325340725354:web:9c1fb2a0e774b675190a13',
  measurementId: 'G-NYXR367F3C'
};

firebase.initializeApp(firebaseConfig);

app.get('/screams', (req, res) => {
  db.collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      console.log(data);
      let screams = [];
      data.forEach(doc => {
        console.log(doc);
        screams.push({
          screamId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
          commentCount: doc.data().commentCount,
          likeCount: doc.data().likeCount
        });
      });
      return res.json(screams);
    })
    .catch(err => console.error(err));
});

app.post('/scream', (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString()
  };

  db.collection('screams')
    .add(newScream)
    .then(() => {
      res.json({ message: `document created successfully` });
    })
    .catch(err => {
      res.status(500).json({ error: 'something went wrong' });
      console.error(err);
    });
});

app.post('/signup', (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle
  };

  let token, userIdSnap;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ handle: 'this handle is already taken' });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userIdSnap = data.user.uid;
      return data.user.getIdToken();
    })
    .then(tokenSnap => {
      token = tokenSnap;
      const userCredentials = {
        handle: newUser.handle,
        email: newUser.email,
        createdAt: new Date().toISOString(),
        userId: userIdSnap
      };
      return db.doc(`/users/${newUser.handle}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
});

//https://baseurl.com/api
exports.api = functions.https.onRequest(app);
