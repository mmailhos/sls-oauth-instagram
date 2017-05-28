'use strict';

const credentials = {
  client: {
    id: process.env.instagram_id,
    secret: process.env.instagram_secret,
  },
  auth: {
    tokenHost: process.env.instagram_tokenHost,
    tokenPath: process.env.instagram_tokenPath
  }
};

// Firebase Setup
const admin = require('firebase-admin');
const serviceAccount = require('../service-account.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const oauth2 = require('simple-oauth2').create(credentials);

module.exports.oauth_callback = (event, context, callback) => {
  const state = event.queryStringParameters.state;
  const code = event.queryStringParameters.code;
  const stateCookie = retrieveStateCookie(event.headers.Cookie);

  if (!state || state === '' || state !== stateCookie) {
    return callback(null, { statusCode: 403 });
  }

  context.callbackWaitsForEmptyEventLoop = false;
  return oauth2.authorizationCode.getToken({
      code: code,
      redirect_uri: event.headers['X-Forwarded-Proto'] + '://' + event.headers.Host + event.requestContext.path
    }).then(results => {
      const accessToken = results.access_token;
      const instagramUserID = results.user.id;
      const profilePic = results.user.profile_picture;
      const userName = results.user.full_name;
      createFirebaseAccount(instagramUserID, userName, profilePic, accessToken).then(firebaseToken => {
        const template = signInFirebaseTemplate(firebaseToken, userName, profilePic, accessToken);
        callback(null, { statusCode: 200, headers: { "Content-Type" : "text/html" }, body: template });
      });
  });
};

function signInFirebaseTemplate(token) {
  return `
    <script src="https://www.gstatic.com/firebasejs/3.6.0/firebase.js"></script>
    <script>
      var token = '${token}';
      var config = {
        apiKey: '${process.env.firebase_key}'
      };
     var app = firebase.initializeApp(config);
     app.auth().signInWithCustomToken(token).then(function() {
       window.close();
     });
    </script>`;
}

function createFirebaseAccount(instagramID, displayName, photoURL, accessToken) {
  const uid = `instagram:${instagramID}`;
  const databaseTask = admin.database().ref(`/instagramAccessToken/${uid}`)
      .set(accessToken);
  const userCreationTask = admin.auth().updateUser(uid, {
    displayName: displayName,
    photoURL: photoURL
  }).catch(error => {
    if (error.code === 'auth/user-not-found') {
      return admin.auth().createUser({
        uid: uid,
        displayName: displayName,
        photoURL: photoURL
      });
    }
    throw error;
  });

  return Promise.all([userCreationTask, databaseTask]).then(() => {
    const token = admin.auth().createCustomToken(uid);
    return token;
  });
}

// Simply parse cookie string and retrieve state value
function retrieveStateCookie(cookie_header) {
  const splited_cookies  = cookie_header.split('=');
  const state_index = splited_cookies.indexOf('state');

  if (state_index === -1) {
    return '';
  }
  return(splited_cookies[splited_cookies.indexOf('state') + 1]);
}
