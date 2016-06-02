import PassportSaml from 'passport-saml';
import { SAMLStrategy } from '../../../../config';

export default class SamlStrategy {

  saml = new PassportSaml.SAML(SAMLStrategy);

  getSamlRequest(req, callback) {
    this.saml.getAuthorizeUrl(req, callback);
  }

  validateSAMLResponse(body, callback) {
    this.saml.validatePostResponse(body, callback);
  }
}
