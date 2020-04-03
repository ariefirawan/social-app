const functions = require('firebase-functions');
const express = require('express');

const { db } = require('./util/admin');
const auth = require('./util/auth');
const posts = require('./handlers/scream');
const userHandler = require('./handlers/user');

const app = express();

app.get('/screams', posts.getAllScreams);
app.post('/scream', auth, posts.addScream);
app.get('/scream/:screamId', posts.getScream);
app.delete('/scream/:screamId', auth, posts.deleteScream);
app.post('/scream/:screamId/comment', auth, posts.commentOnScream);
app.get('/scream/:screamId/like', auth, posts.likeScream);
app.get('/scream/:screamId/unlike', auth, posts.unlikeScream);

app.post('/signup', userHandler.signup);
app.post('/login', userHandler.signIn);
app.post('/imageUpload', auth, userHandler.uploadImage);
app.post('/user', auth, userHandler.addUserDetails);
app.get('/user/:handle', userHandler.getUserDetails);
app.get('/user', auth, userHandler.getAuthenticatedUser);
app.post('/notifications', auth, userHandler.markNotificationsRead);

//https://baseurl.com/api
exports.api = functions.region('asia-east2').https.onRequest(app);

exports.deleteNotificationonUnlike = functions
  .region('asia-east2')
  .firestore.document('likes/{id}')
  .onDelete(snapshot => {
    return db
      .doc(`notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.log(err);
      });
  });
exports.createNotificationOnLike = functions
  .region('asia-east2')
  .firestore.document('likes/{id}')
  .onCreate(snapshot => {
    console.log(snapshot.data());
    return db
      .doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: 'like',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });

exports.createNotificationOnComment = functions
  .region('asia-east2')
  .firestore.document('comments/{id}')
  .onCreate(snapshot => {
    console.log(snapshot.data());
    return db
      .doc(`screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandler,
            sender: snapshot.data().userHandler,
            type: 'comment',
            read: false,
            screamId: doc.id
          });
        }
      })
      .catch(err => {
        console.error(err);
      });
  });

exports.onUserImageChange = functions
  .region('asia-east2')
  .firestore.document('users/{userId}')
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().imageUrl !== change.after.data().imageUrl) {
      const batch = db.batch;
      return db
        .collection('scream')
        .where('userHandle', '==', change.before.data().handle)
        .get()
        .then(data => {
          data.forEach(doc => {
            const scream = db.doc('screams/${doc.id}');
            batch.update(scream, { userImage: change.after.data().imageUrl });
          });
          return batch.commit();
        });
    }
  });

exports.onScreamDelete = functions
  .region('asia-east2')
  .firestore.document('screams/{screamId}')
  .onDelete((snapshot, context) => {
    const screamId = context.params.screamId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('screamId', '==', screamId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`comments/${doc.id}`));
        });
        return db
          .collection('likes')
          .where('screamId', '==', screamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`likes/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('screamId', '==', screamId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`notifications/${doc.id}`));
        });
        return batch.commit();
      });
  });
