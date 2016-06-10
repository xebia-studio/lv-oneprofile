/**
  * Created by Paul-Guillaume Déjardin on 19/04/16.
  * Copyright © 2016 Xebia IT Architects. All rights reserved.
  */

import { Router } from 'express';
import users from './users/users';

const router = new Router({ mergeParams: true });

router.use('/users', users);

export default router;
