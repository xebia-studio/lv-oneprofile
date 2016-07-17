/**
 * Created by Paul-Guillaume Déjardin on 19/04/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import { Router } from 'express';
import UserService from '../../../services/usersService';

const router = new Router();
const usersService = new UserService();

router.get('/', (req, res) => {
  return usersService.getUsers()
    .then(users => {
      return res.send(users);
    });
});

router.get('/:id', (req, res) => {
  return usersService.getUserById(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).end();
      }
      res.send(user);
    })
});

router.post('/ids', (req, res) => {
  const ids = req.body.ids;
  if (!ids) {
    return res.status(400).send({
      error: 'field ids is missing'
    });
  }
  return usersService.getUsersByIds(ids)
    .then(users => {
      res.send(users);
    });
});

router.post('/displayname', (req, res) => {
  return usersService.getUsersByDisplayName(req.body.displayName)
    .then(users => {
      if (!users) {
        return res.send([]);
      }
      return res.send(users);
    });
});

router.get('/infos/countries', (req, res) => {
  return usersService.getDistinctCountriesFromUsers()
    .then(countries => {
      return res.send(countries);
    });
});

router.get('/infos/stores', (req, res) => {
  return usersService.getDistinctStoresFromUsers()
    .then(countries => {
      return res.send(countries);
    });
});

router.post('/login', (req, res) => {
  return usersService.login(req.body.email, req.body.password)
    .then(result => {
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

router.post('/token', (req, res) => {
  return usersService.token(req.body.token)
    .then(result => {
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

router.post('/resetPasswordDemand', (req, res) => {
  return usersService.resetPasswordDemand(req.body.email)
    .then(result => {
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

router.post('/resetPassword', (req, res) => {
  return usersService.resetPassword(req.body.token, req.body.password)
    .then(result => {
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

router.post('/checkPasswordResetTokenIsValid', (req, res) => {
  return usersService.checkPasswordResetTokenIsValid(req.body.token)
    .then(result => {
      return res.send(result);
    })
    .catch(err => {
      return res.status(500).send(err);
    });
});

export default router;
