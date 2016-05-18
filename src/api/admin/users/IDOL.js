import { Router } from 'express';
import passport from 'passport';
import UserService from '../../../services/usersService';

const router = new Router();
const usersService = new UserService();

router.post('/updateUser', passport.authenticate('basic', { session: false }), (req, res, next) => {
  let user = req.body;
  if(!user || user == '') {
    console.error('Update server bad request: no user received in body');
    return res.status(400).end(`Failed to save user: no user received in body.`);
  }
  if(!user.Mail) {
    console.error(`Update server bad request: no email received for user in body : ${JSON.stringify(user)}.`);
    return res.status(400).end(`Failed to save user: no email received for user in body : ${JSON.stringify(user)}.`);
  }
  user = UserService.transformUserFromICON(user);
  usersService.saveUser(user)
  .then(() => {
    res.status(200).end();
  })
  .catch((err) => {
    console.error('Server error :', err.message);
    res.status(500).end(`Server error on user update for: ${JSON.stringify(user)}.`);
  });
});

router.post('/updateServerError', passport.authenticate('basic', { session: false }), (req, res, next) => {
  let user = req.body;
  res.status(500).end(`Server error on user update for: ${JSON.stringify(user)}.`);
});

router.post('/updateBadRequest', passport.authenticate('basic', { session: false }), (req, res, next) => {
  let user = req.body;
  res.status(400).end(`Failed to save user: ${JSON.stringify(user)}.`);
});

export default router;
