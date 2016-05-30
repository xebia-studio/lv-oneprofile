/**
 * Created by Paul-Guillaume Déjardin on 19/04/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import Knex from "knex";
import * as _ from 'lodash';
import { db } from "../config";

export default class UsersServices {

  knex = Knex(db);

  static transformUserDb(user) {
    return {
      id: user.id,
      userName: user.username,
      lastName: user.lastname,
      firstName: user.firstname,
      mail: user.mail,
      country: user.country,
      zone: user.zone,
      seniority: user.seniority,
      workLocation: user.work_location,
      windowsAccount: user.windows_account,
      uniqueId: user.uniqueid,
      displayName: user.displayname
    }
  }

  static transformUserFromICON(user) {
    return {
      username: user.ADAccount,
      lastname: user.Name,
      firstname: user.GivenName,
      mail: user.Mail,
      country: user.Country,
      zone: user.Zone,
      seniority: user.ContractStartDate,
      work_location: user.Store,
      windows_account: user.windows_account,
      uniqueid: user.uniqueid,
      displayname: user.GivenName + ' ' + user.Name
    }
  }

  saveUser(user) {
    return this.getUserId(user.mail)
      .then((userId) => {
        if(userId) {
          return this.updateUser(userId, user).then((res) => {
            return res;
          });
        }
        else {
          return this.insertUser(user).then((res) => {
            return res;
          });
        }
      });
  }

  insertUser(user) {
    return this.knex('users')
      .insert(user)
      .then((res) => {
        return res;
    });
  }

  updateUser(userId, user) {
    return this.knex('users')
      .update(user)
      .where('id', userId)
      .then((res) => {
        return res;
      });
  }

  getUserId(email) {
    return this.knex
      .raw("select id from users where mail = '" + email + "'")
      .then((res) => {
        if(!res.rows.length) {
          return 0;
        }
        return res.rows[0].id;
      });
  }

  getUsers() {
    return this.knex
      .select('*')
      .from('users')
      .then(resultSet => {
        return _.map(resultSet, UsersServices.transformUserDb);
      });
  }

  getUserById(id) {
    return this.knex
      .select('*')
      .from('users')
      .where({ id: id })
      .then(resultSet => {
        return _.head(_.map(resultSet, UsersServices.transformUserDb));
      });
  }

  getUsersByIds(ids) {
    return this.knex
      .select('*')
      .from('users')
      .whereIn('id', ids)
      .then(resultSet => {
        return _.map(resultSet, UsersServices.transformUserDb);
      });
  }

  getUsersByDisplayName(displayName) {
    return this.knex
      .raw(`SELECT *, concat(firstname, ' ', lastname) as displayName
            FROM users
            WHERE concat(firstname, ' ', lastname) ILIKE '%${displayName}%'
            ORDER BY concat(firstname, ' ', lastname) ASC`)
      .then(resultSet => {
        if (!resultSet || _.isEmpty(resultSet.rows)) {
          return []
        }
        return _.map(resultSet.rows, UsersServices.transformUserDb);
      });
  }

  getDistinctCountriesFromUsers() {
    return this.knex
      .distinct('country')
      .select()
      .from('users')
      .whereNotNull('country')
      .then(countries => {
        return _.map(countries, 'country');
      });
  }

  getDistinctStoresFromUsers() {
    return this.knex
      .distinct('work_location')
      .select()
      .from('users')
      .whereNotNull('work_location')
      .then(countries => {
        return _.map(countries, 'work_location');
      });
  }

}
