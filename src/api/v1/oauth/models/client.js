/**
 * Created by pgdejardin on 17/05/16.
 */

import Knex from 'knex';
import { db } from "../../../../config";
import _ from 'lodash';

export default class Client {

  knex = Knex(db);

  static transformClientForOAuth(client) {
    return {
      id: client.id,
      redirectUri: client.redirect_uri,
      clientId: client.client_id,
      name: client.name,
      clientSecret: client.client_secret
    }
  }

  // noinspection JSMethodCanBeStatic
  getId(client) {
    console.log('client :', client);
    return client.clientId;
  }

  fetchById(clientId, cb) {
    let client = {};
    this.knex.select('*')
      .from('clients')
      .where({client_id: clientId})
      .then((data) => {
        client = Client.transformClientForOAuth(data[0]);
        return this.knex('authorization_type')
          .select('grant_type')
          .innerJoin('grant_type', 'authorization_type.grant_type_id', '=', 'grant_type.id')
          .where(
            {
              client_id: client.clientId
            }
          )})
      .then((data) => {
        client.grantTypes = _.map(data, 'grant_type');
        console.log('client :', client);
        cb(null, client);
      });
  }

  transformScope(scope) {
    return 1;
  }

  checkScope(client, scope) {
    return 1;
  }

  checkGrantType(client, grantType) {
    return client.grantTypes.indexOf(grantType) != -1;
  }

  // noinspection JSMethodCanBeStatic
  getRedirectUri(client) {
    return client.redirectUri;
  }

  // noinspection JSMethodCanBeStatic
  checkRedirectUri(client, redirectUri) {
    return (redirectUri.indexOf(getRedirectUri(client)) === 0 &&
    redirectUri.replace(getRedirectUri(client), '').indexOf('#') === -1);
  }

  // noinspection JSMethodCanBeStatic
  checkSecret(client, secret, cb) {
    //TODO: Compléter avec un hash ?
    return cb(null, client.clientSecret == secret);
  };

}
