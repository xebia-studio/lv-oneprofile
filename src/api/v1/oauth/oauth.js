/**
 * Created by Paul-Guillaume Déjardin on 17/05/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import { Router } from 'express';
import Oauth2Lib from 'oauth20-provider';
import Client from './models/client';
import Code from './models/code';
import SamlStrategy from './strategy/samlStrategy';

export const oauth2 = new Oauth2Lib({log: {level: 4}});
const router = new Router();
const samlStrategy = new SamlStrategy();

oauth2.model.client = new Client();
oauth2.model.code = new Code(31536000); //1y

// Step 1: Define OAuth2 Authorization Endpoint
router.get('/authorization', isUserAuthenticated, (req, res, next) => {
  req.session.authorized = true;
  //TODO POST /authorization {decision: 1}
  next();
});

// Callback for SAML
router.post('/login', () => {
  //TODO: getUserFromDB
  //TODO: session.user = userFromDB;
});

// Ask for a code
router.post('/authorization', isUserAuthorized, oauth2.controller.authorization);

// Define OAuth2 Token Endpoint
router.post('/token', oauth2.controller.token);

// Middleware. User authorization
// noinspection JSUnusedLocalSymbols
function isUserAuthorized(req, res, next) {
  if (req.session.authorized) next();
  else {
    req.session.authorized = true;
    next();
  }
}

function isUserAuthenticated(req, res, next) {
  if (req.session.user && req.session.user.id) next();
  else {
    // TODO Verifier
    return samlStrategy.getSamlRequest(req, (err, samlRequest) => {
      if (!err) {
        req.session.clientId = req.query.client_id;
        req.session.redirectUri = req.query.redirect_uri;
        return res.redirect(samlRequest);
      }
      // TODO: Gérer erreurs (redirect sur redirect_uri avec code 503 ou 50X)
      next();
    });
  }
}

export default router;
