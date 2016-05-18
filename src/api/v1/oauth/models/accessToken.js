/**
  * Created by Paul-Guillaume Déjardin on 17/05/16.
  * Copyright © 2016 Xebia IT Architects. All rights reserved.
  */

import Knex from 'knex';
import { db } from "../../../../config";
import crypto from 'crypto';
import _ from 'lodash';

export default class User {

  knex = Knex(db);

  getToken(accessToken) {
    return accessToken;
  };

  create(userId, clientId, scope, ttl, cb) {
    const token = crypto.randomBytes(64).toString('hex');
    const expires = new Date().getTime() + ttl * 1000;
    const obj =
    {
      token: token,
      user_id: userId,
      client_id: clientId,
      expires: expires,
      scope: scope
    };
    this.knex()
      .select('id')
      .from('access_tokens')
      .where({cliend_id: clientId, user_id: userId})
      .then((rows) => {
        if(rows.length) {
          const row = _.head(rows);
          this.knex('access_tokens')
            .where('id', row.id)
            .update(obj)
            .asCallback((err, result) => {
              if(err) return cb(err);
              return cb(null, token);
            });
        }
        else {
          this.knex('access_tokens')
            .insert(obj)
            .asCallback((err, result) => {
              if(err) return cb(err);
              return cb(null, token);
            });
        }
      })
  };

  var fetchByToken = function(token, cb) {
    this.knex.select('*')
      .from('access_tokens')
      .where({token: token})
      .asCallback(cb);
  };

  var fetchByUserIdClientId = function(userId, clientId, cb) {
    this.knex.select('*')
      .from('access_tokens')
      .where({user_id: userId, client_id: clientId})
      .asCallback(cb);
  };

}
