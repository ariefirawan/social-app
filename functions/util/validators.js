const isEmpty = string => {
  if (string.trim() === '') return true;
  else return false;
};

const isEmail = email => {
  const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(emailRegEx)) return true;
  else return false;
};

exports.validateSignupData = data => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = 'must not be empty';
  } else if (!isEmail(data.email)) {
    errors.email = 'must be a valid email address';
  }
  if (isEmpty(data.password)) {
    errors.password = 'must not be empty';
  } else if (data.password.length < 6) {
    errors.password = 'password minimal 6 characther';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'password not match';
  }
  if (isEmpty(data.handle)) {
    errors.handle = 'must not be empty';
  }
  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.validateSignInData = user => {
  let errors = {};

  if (isEmpty(user.email)) {
    errors.email = 'must not be empty';
  }
  if (isEmpty(user.password)) {
    errors.password = 'must not be empty';
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json(errors);
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false
  };
};

exports.reduceUserDetails = data => {
  let userDetails = {};

  if (!isEmpty(data.bio.trim())) {
    userDetails.bio = data.bio;
  }
  if (!isEmpty(data.website.trim())) {
    //jika web tidak menggunakan ssl (https) maka default nya http
    if (data.website.trim().substring(0, 4) !== 'http') {
      userDetails.website = `http://${data.website}`;
    } else userDetails.website = data.website;
  }
  if (!isEmpty(data.location.trim())) {
    userDetails.location = data.location;
  }

  return userDetails;
};
