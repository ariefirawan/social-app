const { admin, db } = require('./admin');

module.exports = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    idToken = req.headers.authorization.split('Bearer ')[1];
  } else {
    console.error('no Token found');
    return res.status(403).json({ error: 'Unauthorized' });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodeToken => {
      req.user = decodeToken;
      return db
        .collection('users')
        .where('userId', '==', req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      console.log(data);
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error('error while verifying token', err);
      return res.status(400).json(err);
    });
};
