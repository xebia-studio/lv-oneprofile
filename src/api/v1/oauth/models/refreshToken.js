/**
  * Created by Paul-Guillaume Déjardin on 17/05/16.
  * Copyright © 2016 Xebia IT Architects. All rights reserved.
  */

import Knex from 'knex';
import { db } from "../../../../config";
import crypto from 'crypto';

export default class RefreshToken {

  knex = Knex(db);

  getToken(accessToken) {
    return accessToken;
  };

  getUserId(refreshToken) {
    return refreshToken.userId;
  };

  getClientId(refreshToken) {
    return refreshToken.clientId;
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
      .from('refresh_tokens')
      .where({cliend_id: clientId, user_id: userId})
      .then((rows) => {
        if(rows.length) {
          const row = _.head(rows);
          this.knex('refresh_tokens')
            .where('id', row.id)
            .update(obj)
            .asCallback((err, result) => {
              if(err) return cb(err);
              return cb(null, token);
            });
        }
        else {
          this.knex('refresh_tokens')
            .insert(obj)
            .asCallback((err, result) => {
              if(err) return cb(err);
              return cb(null, token);
            });
        }
      })
  };

  fetchByToken(token, cb) {
    this.knex.select('*')
      .from('refresh_tokens')
      .where({token: token})
      .asCallback(cb);
  };

  fetchByUserIdClientId(userId, clientId, cb) {
    this.knex.select('*')
      .from('refresh_tokens')
      .where({user_id: userId, client_id: clientId})
      .asCallback(cb);
  };

  removeByUserIdClientId(userId, clientId, cb) {
    this.knex('refresh_tokens')
      .where({user_id: userId, client_id: clientId})
      .del()
      .asCallback(cb);
  }

}
