/**
 * Created by Arthur Sudre on 29/04/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import { Router } from 'express';
import IDOLApi from './users/IDOL';

const router = new Router({ mergeParams: true });

router.use('/users/idol', IDOLApi);

export default router;

