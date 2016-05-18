import PassportSaml from 'passport-saml';
import { SAML } from '../../../../config'

export default class SamlStrategy {

  saml = new PassportSaml.SAML(SAML);

  getSamlRequest(req, callback) {
    this.saml.getAuthorizeUrl(req, callback);
  }

  validateSAMLResponse(body, callback) {
    this.saml.validatePostResponse(body, callback);
  }
}
