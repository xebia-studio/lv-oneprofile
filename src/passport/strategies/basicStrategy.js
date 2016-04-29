import { BasicStrategy } from 'passport-http';
import { idol } from './../../config';

export default new BasicStrategy((username, password, done) => {
    if(username == idol.credentials.username && password == idol.credentials.password) {
      done(null, true);
    }
    else {
			done(null, false);
		}
	}
);
