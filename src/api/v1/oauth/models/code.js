/**
 * Created by Paul-Guillaume Déjardin on 17/05/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import crypto from 'crypto';
import Knex from 'knex';
import moment from 'moment';
import _ from 'lodash';
import { db } from '../../../../config';

export default class Code {

  knex = Knex(db);
  ttl = 36000000;

  constructor(ttl) {
    this.ttl = ttl;
    console.log(this.ttl);
  }

  create(userId, clientId, scope, ttl, cb) {
    var code = crypto.randomBytes(32).toString('hex');
    var item = {code: code, user_id: userId, client_id: clientId, scope: scope, expires: moment(new Date()).add(ttl)};

    this.knex.select('*')
      .from('authorization_codes')
      .where({
        user_id: userId,
        client_id: clientId
      })
      .then((rows) => {
        const result = _.head(rows);
        if (result && result.id) {
          return this.knex('authorization_codes')
            .update(item)
            .where({
              id: result.id
            });
        }
        return this.knex.insert(item).into('authorization_codes');
      })
      .then(() => cb(null, code));
  }

  fetchByCode(item, cb) {
    this.knex.select('*')
      .from('authorization_codes')
      .where({
        id: item.id
      })
      .asCallback(cb);
  }

  getUserId(item) {
    return item.user_id;
  }

  getClientId(item) {
    return item.client_id;
  }

  checkTtl(item) {
    return moment(item.expires).isAfter(moment());
  }

  removeByCode(item, cb) {
    this.knex('authorization_codes')
      .where({
        code: item.code
      })
      .del()
      .asCallback(cb)
  }

  getScope() {
    return {};
  }

}
