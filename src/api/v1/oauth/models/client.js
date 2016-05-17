/**
 * Created by pgdejardin on 17/05/16.
 */

import Knex from 'knex';
import { db } from "../../../../config";

export default class Client {

  knex = Knex(db);

  // noinspection JSMethodCanBeStatic
  getId(client) {
    return client.id;
  }

  fetchById(clientId, cb) {
    //TODO: Vérifier la requete
    this.knex.select('*')
      .from('clients')
      .innerJoin('clients.id', '=', 'authorization_type.client')
      .join('authorization_type.grant_type', '=', 'grant_type.id')
      .where({client_id: clientId})
      .asCallback(cb);
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
    return cb(null, client.secret == secret);
  };

}
