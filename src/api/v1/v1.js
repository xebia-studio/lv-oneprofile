/**
  * Created by Paul-Guillaume Déjardin on 19/04/16.
  * Copyright © 2016 Xebia IT Architects. All rights reserved.
  */

import { Router } from 'express';
import users from './users/users';
import oauth from './oauth/oauth';

const router = new Router({ mergeParams: true });

router.use('/users', users);

router.use('/oauth', oauth);

export default router;
