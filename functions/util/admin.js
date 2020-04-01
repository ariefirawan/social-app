const admin = require('firebase-admin');

const serviceAccount = require('../socialapp-d5975-9bc2ed23b4ff.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://socialapp-d5975.firebaseio.com'
});
const db = admin.firestore();

module.exports= {db, admin}