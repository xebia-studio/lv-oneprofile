/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* eslint-disable max-len */
/* jscs:disable maximumLineLength */

import fs from 'fs';

export const port = process.env.PORT || 3000;
export const host = process.env.WEBSITE_HOSTNAME || `localhost:${port}`;

//export const databaseUrl = process.env.DATABASE_URL ||
//  'postgresql://demo:Lqk62xg6TBm5UhfR@demo.ctbl5itzitm4.us-east-1.rds.amazonaws.com:5432/membership01';

export const analytics = {

  // https://analytics.google.com/
  google: { trackingId: process.env.GOOGLE_TRACKING_ID || 'UA-XXXXX-X' },

};

export const auth = {

  jwt: { secret: process.env.JWT_SECRET || 'React Starter Kit' },

  // https://developers.facebook.com/
  facebook: {
    id: process.env.FACEBOOK_APP_ID || '186244551745631',
    secret: process.env.FACEBOOK_APP_SECRET || 'a970ae3240ab4b9b8aae0f9f0661c6fc',
  },

  // https://cloud.google.com/console/project
  google: {
    id: process.env.GOOGLE_CLIENT_ID || '251410730550-ahcg0ou5mgfhl8hlui1urru7jn5s12km.apps.googleusercontent.com',
    secret: process.env.GOOGLE_CLIENT_SECRET || 'Y8yR9yZAhm9jQ8FKAL8QIEcd',
  },

  // https://apps.twitter.com/
  twitter: {
    key: process.env.TWITTER_CONSUMER_KEY || 'Ie20AZvLJI2lQD5Dsgxgjauns',
    secret: process.env.TWITTER_CONSUMER_SECRET || 'KTZ6cxoKnEakQCeSpZlaUCJWGAlTEBJj0y2EMkUBujA7zWSvaQ',
  },

};

export const db = {
  debug: process.env.NODE_ENV !== 'production',
  client: 'pg',
  connection: {
    host: process.env.POSTGRESQL_HOSTNAME || 'localhost',
    port: process.env.POSTGRESQL_PORT || 5432,
    database: process.env.POSTGRESQL_DATABASE || 'oneprofile',
    user: process.env.POSTGRESQL_USERNAME || 'lvlearningdev',
    password: process.env.POSTGRESQL_PASSWORD || 'lvlearningdev2016!',
    charset: (process.env.POSTGRESQL_CHARSET || 'UTF8MB4_GENERAL_CI').toUpperCase()
  },
  pool: {
    min: process.env.POSTGRESQL_POOL_MIN || 0,
    max: process.env.POSTGRESQL_POOL_MAX || 256,
    bailAfter: process.env.POSTGRESQL_BAIL_AFTER || Infinity
  }
};

export const idol = {
  credentials: {
    username: process.env.IDOL_USERNAME || 'idol',
    password: process.env.IDOL_PASSWORD || 'idolP@ss'
  }
};

export const SAMLStrategy = {
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://fed-prp.vuitton.biz/adfs/ls/',
  issuer: process.env.SAML_ISSUER || 'LV-ONEPROFILE',
  callbackUrl: process.env.SAML_CALLBACK_URL || 'https://oneprofile-prd.herokuapp.com/api/v1/oauth/login',
  cert: process.env.SAML_CERTIFICATE,
  privateCert: fs.readFileSync(`${__dirname}/certificates/saml/saml.pem`, 'utf-8'),
  decryptionPvk: fs.readFileSync(`${__dirname}/certificates/saml/saml.pem`, 'utf-8'),
  identifierFormat: null
};

export const SAML = {
  entryId: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
};
