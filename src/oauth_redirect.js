'use strict';

const crypto = require('crypto');

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

const oauth2 = require('simple-oauth2').create(credentials);

module.exports.oauth_redirect = (event, context, callback) => {

  const state = crypto.randomBytes(20).toString('hex');
  const outCookie = 'state='  + state + '; maxAge=3600000;  secure=true; httpOnly=true';
  const redirectUri = oauth2.authorizationCode.authorizeURL({
    redirect_uri: event.headers['X-Forwarded-Proto'] + '://' + event.headers.Host + '/dev/instagram-callback',
    scope: 'basic',
    state: state
  });

  const response = {
    statusCode: 302,
    headers: {
      "Location": redirectUri,
      "Set-Cookie": outCookie
    }
  };

  callback(null, response);
};
