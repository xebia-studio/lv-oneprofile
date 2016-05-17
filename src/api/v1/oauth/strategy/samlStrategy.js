import PassportSaml from 'passport-saml';
import fs from 'fs';

export default class SamlStrategy {

  saml = new PassportSaml.SAML({
    entryPoint: process.env.SAML_ENTRY_POINT || 'https://fed-prp.vuitton.biz/adfs/ls/',
    issuer: 'LV-LIVE',
    callbackUrl: 'https://lvlive-prp.louisvuitton.com/api/auth/login/callback',
    cert: process.env.SAML_CERTIFICATE,
    privateCert: fs.readFileSync(`${__dirname}/certificates/saml/saml.pem`, 'utf-8'),
    decryptionPvk: fs.readFileSync(`${__dirname}/certificates/saml/saml.pem`, 'utf-8'),
    identifierFormat: null
  });

  getSamlRequest(req, callback) {
    this.saml.getAuthorizeUrl(req, callback);
  }

  validateSAMLResponse(body, callback) {
    this.saml.validatePostResponse(body, callback);
  }
}
