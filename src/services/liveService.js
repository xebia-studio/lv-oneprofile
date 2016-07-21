/**
 * Created by Arthur Sudre on 21/07/16.
 * Copyright © 2016 Xebia IT Architects. All rights reserved.
 */

import request from 'request-promise';
import { live } from "../config";

export default class LiveService {

  sendWebhook(user) {
    const options = {
      method: 'POST',
      uri: live.host + live.usersUpdateEndpoint,
      json: true,
      headers: {
        'Authorization': 'Basic ' + live.basicAuthorization
      },
      body: user,
      resolveWithFullResponse: true
    };
    return request(options);
  };

}
