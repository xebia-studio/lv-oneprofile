/**
 * Created by Paul-Guillaume Déjardin on 19/04/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import { Router } from 'express';
import UserService from '../../../services/usersService';

const router = new Router();
const usersService = new UserService();

router.post('/displayname', (req, res) => {
  return usersService.getUsersByDisplayName(req.body.displayName)
    .then(users => {
      if (!users) {
        return res.send([]);
      }
      return res.send(users);
    });
});

export default router;
