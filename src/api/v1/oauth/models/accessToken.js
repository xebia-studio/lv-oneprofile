/**
  * Created by Paul-Guillaume Déjardin on 17/05/16.
  * Copyright © 2016 Xebia IT Architects. All rights reserved.
  */

import Knex from 'knex';
import { db } from "../../../../config";
import crypto from 'crypto';
import moment from 'moment';
import _ from 'lodash';

export default class AccessToken {

  knex = Knex(db);
  ttl = 36000000;

  constructor(ttl) {
    this.ttl = ttl;
  }

  getToken(accessToken) {
    return accessToken;
  };

  create(userId, clientId, scope, ttl, cb) {
    const token = crypto.randomBytes(64).toString('hex');
    const expires = moment(new Date()).add(ttl);
    const obj =
    {
      access_token: token,
      user_id: userId,
      client_id: clientId,
      expires: expires,
      scope: scope
    };
    this.knex()
      .select('id')
      .from('access_tokens')
      .where({client_id: clientId, user_id: userId})
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

  fetchByToken = function(token, cb) {
    this.knex('access_tokens').select('*')
      .from('access_tokens')
      .where({token: token})
      .asCallback(cb);
  };

  fetchByUserIdClientId = function(userId, clientId, cb) {
    this.knex('access_tokens').select('*')
      .from('access_tokens')
      .where({user_id: userId, client_id: clientId})
      .asCallback(cb);
  };

}
