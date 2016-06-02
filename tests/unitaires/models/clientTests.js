const assert = require('chai').assert;

const Knex = require("knex");
const _ = require('lodash');
const request = require('request');

process.env.PORT=9000;
process.env.POSTGRESQL_DATABASE='oneprofile';
process.env.POSTGRESQL_USERNAME='arthursudre';
process.env.POSTGRESQL_PASSWORD='';

describe('Model for clients', function() {

  var server;
  var knex;

  beforeEach(function () {
    server = require('./../../../build/server');
    knex = Knex({
      client: 'pg',
      connection: {
        host: process.env.POSTGRESQL_HOSTNAME || 'localhost',
        port: process.env.POSTGRESQL_PORT || 5432,
        database: process.env.POSTGRESQL_DATABASE || 'oneprofile',
        user: process.env.POSTGRESQL_USERNAME || 'lvlearningdev',
        password: process.env.POSTGRESQL_PASSWORD || 'lvlearningdev2016!',
        charset: 'UTF8MB4_GENERAL_CI'.toUpperCase()
      },
      pool: {
        min: process.env.POSTGRESQL_POOL_MIN || 0,
        max: process.env.POSTGRESQL_POOL_MAX || 256,
        bailAfter: process.env.POSTGRESQL_BAIL_AFTER || Infinity
      }
    });
  });

  transformClientForOAuth = function(client) {
    console.log('ici :', client);
    return {
      id: client.id,
      redirectUri: client.redirect_uri,
      clientId: client.client_id,
      name: client.name,
      clientSecret: client.client_secret
    }
  };

  it('should get the client from id', function(done) {
    var client = {};
    const client_id = 1;
    return knex.select()
      .from('clients')
      .where({client_id: client_id})
      .then((data) => {
        client = transformClientForOAuth(data[0]);
        return knex('authorization_type')
          .select('grant_type')
          .innerJoin('grant_type', 'authorization_type.grant_type_id', '=', 'grant_type.id')
          .where(
            {
              client_id: client.clientId
            }
      )})
      .then((data) => {
        client.grantTypes = _.map(data, 'grant_type');
        console.log(client);
        done();
      });
  });

  it('should check grant type for client', function(done) {
    const grant_type = 'authorization_code';
    const client = { id: 1,
      redirectUri: 'https://lvlive.herokuapp.com',
      clientId: '1',
      name: 'LIVE',
      clientSecret: '123',
      grantTypes: [ 'authorization_code', 'implicit' ] };

    assert.equal(client.grantTypes.indexOf(grant_type), 0);
    assert.equal(client.grantTypes.indexOf(grant_type + 'f'), -1);

    done();

  });

});
