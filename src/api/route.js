/**
 * Created by Paul-Guillaume Déjardin on 19/04/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import { Router } from 'express';
import v1 from './v1/v1';
import adminRoute from './admin';

const router = new Router({ mergeParams: true });

router.use('/v1', v1);
router.use('/admin', adminRoute);

export default router;
