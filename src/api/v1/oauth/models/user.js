/**
  * Created by Paul-Guillaume Déjardin on 17/05/16.
  * Copyright © 2016 Xebia IT Architects. All rights reserved.
  */

import Knex from 'knex';
import { db } from "../../../../config";

export default class User {

  knex = Knex(db);

  

}
