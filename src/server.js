/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import 'babel-polyfill';
import path from 'path';
import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import expressGraphQL from 'express-graphql';
import ReactDOM from 'react-dom/server';
import PrettyError from 'pretty-error';
import strategy from './passport/strategies/basicStrategy';
import passport from 'passport';
import schema from './data/schema';
import Router from './routes';
import assets from './assets';
import { port, auth, analytics } from './config';
import api from './api/route';
/*
 import expressJwt from 'express-jwt';
 import jwt from 'jsonwebtoken';
 import passport from './core/passport';
 */
import session from 'express-session';
import pg from 'pg';
import connectPg from 'connect-pg-simple';

const server = global.server = express();
const PgSession = connectPg(session);

//
// Tell any CSS tooling (such as Material UI) to use all vendor prefixes if the
// user agent is not known.
// -----------------------------------------------------------------------------
global.navigator = global.navigator || {};
global.navigator.userAgent = global.navigator.userAgent || 'all';

//
// Register Node.js middleware
// -----------------------------------------------------------------------------
server.use(express.static(path.join(__dirname, 'public')));
server.use(cookieParser());
server.use(session({
  store: new PgSession({
    pg: pg, // Use global pg-module
    conString: process.env.DATABASE_URL || 'postgres://lvlearningdev:lvlearningdev2016!@localhost/oneprofile',
    tableName: 'session' // Use another table-name than the default "session" one
  }),
  secret: 'oneprofilesecret',
  resave: false,
  saveUninitialized: false,
  user: null
}));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

passport.use(strategy);

//
// Register API middleware
// -----------------------------------------------------------------------------
server.use('/graphql', expressGraphQL(req => ({
  schema,
  graphiql: true,
  rootValue: { request: req },
  pretty: process.env.NODE_ENV !== 'production'
})));

server.use('/api', api);

//
// Register server-side rendering middleware
// -----------------------------------------------------------------------------
server.get('*', async(req, res, next) => {
  try {
    let statusCode = 200;
    const template = require('./views/index.jade');
    const data = { title: '', description: '', css: '', body: '', entry: assets.main.js };

    if (process.env.NODE_ENV === 'production') {
      data.trackingId = analytics.google.trackingId;
    }

    const css = [];
    const context = {
      insertCss: styles => css.push(styles._getCss()),
      onSetTitle: value => (data.title = value),
      onSetMeta: (key, value) => (data[key] = value),
      onPageNotFound: () => (statusCode = 404)
    };

    await Router.dispatch({ path: req.path, query: req.query, context }, (state, component) => {
      data.body = ReactDOM.renderToString(component);
      data.css = css.join('');
    });

    res.status(statusCode);
    res.send(template(data));
  } catch (err) {
    next(err);
  }
});

//
// Error handling
// -----------------------------------------------------------------------------
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

server.use((err, req, res) => { // eslint-disable-line no-unused-vars
  console.log(pe.render(err)); // eslint-disable-line no-console
  const template = require('./views/error.jade');
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.send(template({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '' : err.stack
  }));
});

//
// Launch the server
// -----------------------------------------------------------------------------
server.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`The server is running at http://localhost:${port}/`);
});
