/**
 * Created by Paul-Guillaume Déjardin on 17/05/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import { Router } from 'express';
import Oauth2Lib from 'oauth20-provider';
import Client from './models/client';
import Code from './models/code';
import UsersService from '../../../services/usersService';
import SamlStrategy from './strategy/samlStrategy';
import request from 'request';
import { SAML } from '../../../config';

export const oauth2 = new Oauth2Lib({log: {level: 0}});
const router = new Router();
const samlStrategy = new SamlStrategy();

const usersService = new UsersService();
oauth2.model.client = new Client();
oauth2.model.code = new Code(31536000); //1y
oauth2.model.user = new UsersService();

// Step 1: Define OAuth2 Authorization Endpoint
router.get('/authorization', isUserAuthenticated, (req, res, next) => {
  req.session.authorized = true;
  //TODO POST /authorization {decision: 1}

  next();
});

// Callback for SAML
router.post('/login', (req, res, next) => {
  samlStrategy.validateSAMLResponse(req.body, (err, profile) => {
    console.log('saml response :', profile);
    if(err) return; //TODO 403
    var userEmail = profile[SAML.entryId];
    usersService.getUserByEmail(userEmail)
      .then((user) => {

        if(!user) return; //TODO 403

        req.session.user = user;
        console.log('session :', req.session);

        //TODO vérifier la valeur de requestUri à partir de clientId

        request.post('https://oneprofile-dev.herokuapp.com/api/v1/oauth/authorization?client_id=' + req.session.clientId + '&redirect_uri=' + req.session.redirectUri + '&response_type=code',
          {
            form: {
              session: req.session
            }
          },
          (err, response, body) => {
          console.log(err);
        })
      });
  });
});

// Ask for a code
router.post('/authorization', (req, res, next) => {
  console.log(req.body);
  next();
}, isUserAuthorized, oauth2.controller.authorization);

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
