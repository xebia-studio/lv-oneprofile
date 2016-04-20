/**
 * Created by Paul-Guillaume Déjardin on 19/04/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import Knex from "knex";
import * as _ from 'lodash';
import { db} from "../config";

export default class UsersServices {

  knex = Knex(db);

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

  static transformUserDb(user) {
    return {
      id: user.id,
      userName: user.username,
      lastName: user.lastname,
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

}
