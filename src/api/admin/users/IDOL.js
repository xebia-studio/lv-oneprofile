import { Router } from 'express';
import passport from 'passport';
import moment from 'moment';
import UserService from '../../../services/usersService';

const router = new Router();
const usersService = new UserService();

router.post('/updateUser', passport.authenticate('basic', { session: false }), (req, res, next) => {

  let user = req.body;
  user = UserService.transformUserFromICON(user);
  usersService.saveUser(user)
  .then(() => {
    res.status(200).end();
  });
});

export default router;
