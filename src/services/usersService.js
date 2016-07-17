/**
 * Created by Paul-Guillaume Déjardin on 19/04/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import Knex from "knex";
import * as _ from 'lodash';
import { db } from "../config";
import * as bcrypt from 'bcryptjs';
import * as uuid from 'uuid';
import moment from 'moment';

export default class UsersServices {

  knex = Knex(db);

  static transformUserDb(user) {
    return {
      id: user.id,
      userName: user.username,
      lastName: user.lastname,
      firstName: user.firstname,
      job: user.job,
      email: user.email,
      country: user.country,
      zone: user.zone,
      seniority: user.seniority,
      workLocation: user.work_location,
      uniqueId: user.unique_id,
      displayName: user.displayname,
      event: user.event,
      flagLive: user.flag_live,
      flagLearning: user.flag_learning
    }
  };

  static transformUserFromICON(user) {
    return {
      username: user.ADAccount,
      lastname: user.Name,
      firstname: user.GivenName,
      job: user.JobClassificationLabel,
      email: user.Mail,
      country: user.Country,
      zone: user.Zone,
      seniority: UsersServices.getSeniorityValue(user.ContractStartDate),
      work_location: user.Store,
      unique_id: user.HRUniqueID,
      displayname: user.GivenName + ' ' + user.Name,
      event: user.Event,
      flag_live: user.lvmLiveEntitlement,
      flag_learning: user.lvmLearningEntitlement
    }
  };

  static getSeniorityValue(date) {
    const objDate = new Date(date);
    return objDate.toLocaleString("en-EN", { month:"long", year: "numeric" });
  };

  getId(user) {
    return user.id;
  };

  fetchFromRequest(request) {
    console.log('request.body.session :', request.body.session);
    console.log('user :', request.session.user);
    return request.body.session.user;
  };

  getUserByEmail(email) {
    return this.knex
      .select('*')
      .from('users')
      .where({ email: email })
      .then(resultSet => {
        return _.head(_.map(resultSet, UsersServices.transformUserDb));
      });
  };

  saveUser(user) {
    return this.getUserId(user.email)
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
  };

  insertUser(user) {
    return this.knex('users')
      .insert(user)
      .then((res) => {
        return res;
    });
  };

  updateUser(userId, user) {
    user.updated_at = new Date();
    return this.knex('users')
      .update(user)
      .where('id', userId)
      .then((res) => {
        return res;
      });
  };

  getUserId(email) {
    return this.knex
      .raw("select id from users where email = '" + email + "'")
      .then((res) => {
        if(!res.rows.length) {
          return 0;
        }
        return res.rows[0].id;
      });
  };

  getUsers() {
    return this.knex
      .select('*')
      .from('users')
      .then(resultSet => {
        return _.map(resultSet, UsersServices.transformUserDb);
      });
  };

  getUserById(id) {
    return this.knex
      .select('*')
      .from('users')
      .where({ id: id })
      .then(resultSet => {
        return _.head(_.map(resultSet, UsersServices.transformUserDb));
      });
  };

  getUsersByIds(ids) {
    return this.knex
      .select('*')
      .from('users')
      .whereIn('id', ids)
      .then(resultSet => {
        return _.map(resultSet, UsersServices.transformUserDb);
      });
  };

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
  };

  getDistinctCountriesFromUsers() {
    return this.knex
      .distinct('country')
      .select()
      .from('users')
      .whereNotNull('country')
      .then(countries => {
        return _.map(countries, 'country');
      });
  };

  getDistinctStoresFromUsers() {
    return this.knex
      .distinct('work_location')
      .select()
      .from('users')
      .whereNotNull('work_location')
      .then(countries => {
        return _.map(countries, 'work_location');
      });
  };

  login(email, password) {
    return new Promise((resolve, reject) => {
      return this.knex("users").where({email: email}).then((foundUsers) => {
        if (!foundUsers || foundUsers.length != 1) {
          return reject({user: 0, message: 'Incorrect email', email: email});
        }
        return bcrypt.compare(password, foundUsers[0].password, (err, res) => {
          if (!res) {
            return reject({user: 0, message: 'Incorrect password', email: email});
          } else {
            return resolve({user: foundUsers[0]});
          }
        });
      }).catch((err) => {
        return reject({user: 0, message: err.message ? err.message : err, email: email});
      });
    });
  };

  token(token) {
    return new Promise((resolve, reject) => {
      return this.knex("users").where({token: token}).then((users) => {
        if (!users || users.length != 1) {
          return reject({user: 0, message: 'User not found from token', token: token});
        }
        else {
          return resolve({user: users[0]});
        }
      }).catch((err) => {
        return reject({user: 0, message: err.message ? err.message : err, token: token});
      });
    });
  };

  resetPasswordDemand(email) {
    return new Promise((resolve, reject) => {
      return this.knex('users').where({email: email}).first().then((user) => {
        if (!user) {
          return reject({
            user: 0,
            message: `Email '${email}' does not match an existing account. Please contact organizers.`,
            email: email,
            code: 'UNKNOWN_EMAIL'
          });
        }
        else {
          const resetToken = user.resettoken || uuid.v4();
          const userDataToUpdate = {
            resettoken: resetToken,
            resetdemandexpirationdate: moment().add(2, 'hours').format('YYYY-MM-DDTHH:mm:ss')
          };
          return this.knex('users').where({email: email}).update(userDataToUpdate).then(() => {
            return resolve({user: user});
          });
        }
      })
      .catch((err) => {
        return reject({user: 0, message: err.message ? err.message : err, email: email});
      });
    })
  }

  resetPassword(resetToken, password) {
    return new Promise((resolve, reject) => {
      return DB.knex('users').where({resettoken: resetToken}).then((foundUsers) => {
        if (!foundUsers || foundUsers.length != 1) {
          return reject({
            user: 0,
            message: 'No matching user found with reset token: ' + resetToken + '. Token provided may have been already used. Please, ask for a new password reset.',
            resetToken: resetToken
          });
        }
        else if (moment().isAfter(moment(foundUsers[0].resetdemandexpirationdate))) {
          return reject({
            user: 0,
            message: 'Reset token has expired',
            resetToken: resetToken,
            code: 'RESET_TOKEN_EXPIRED'
          });
        }
        else {
          return DB.knex('users').where({resettoken: resetToken}).update({
            password: this.generatePassword(password),
            resettoken: ''
          })
          .then(() => {
            return resolve({user: foundUsers[0]});
          });
        }
      })
      .catch((err) => {
        return reject({user: 0, message: err.message ? err.message : err, resetToken: resetToken});
      });
    });
  };

  generatePassword(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync());
  };

  checkPasswordResetTokenIsValid(resetToken) {
    return new Promise((resolve, reject) => {
      return this.knex('users').where({resettoken: resetToken}).then((foundUsers) => {
        if (!foundUsers || foundUsers.length != 1) {
          return reject({
            user: 0,
            message:`No matching user found for reset token: '${resetToken}'. Token provided may have been already used. Please, ask for a new password reset.`,
            resetToken: resetToken,
            code: 'INVALID_RESET_TOKEN'
          });
        } else if (moment().isAfter(moment(foundUsers[0].resetdemandexpirationdate))) {
          return reject({
            user: 0,
            message: 'Reset token has expired',
            resetToken: resetToken,
            code: 'RESET_TOKEN_EXPIRED'
          });
        } else {
          return resolve({user: foundUsers[0]});
        }
      })
      .catch((err) => {
        return reject({user: 0, message: err.message ? err.message : err, resetToken: resetToken});
      });
    });
  }

}
