DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  username        TEXT,
  lastname        TEXT,
  firstname       TEXT,
  displayname     TEXT,
  mail            TEXT NOT NULL,
  country         TEXT,
  zone            TEXT,
  seniority       TEXT,
  work_location   TEXT,
  windows_account TEXT,
  uniqueID        TEXT
);
-- CREATE INDEX users_email ON users USING BTREE (mail);

-- SELECT CONCAT('INSERT INTO users (
--     "displayname",
--     "username",
--     "lastname",
--     "firstname",
--     "mail",
--     "country",
--     "zone",
--     "seniority",
--     "work_location")
--     values (''', infos.displayname, ''', ''', lower(replace(CONCAT(LEFT(infos.firstname , 1), infos.lastname) , ' ','')), ''', ''', infos.lastname, ''', ''', infos.firstname, ''', ''', infos.mail, ''', ''', ifnull(infos.country, ''), ''', ''', ifnull(infos.zone, ''), ''', ''', ifnull(infos.seniority, ''), ''', ''', ifnull(infos.work_location, ''), ''');')
--   from (SELECT
--       id,
--       displayName as displayname,
--       SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 1), ' ', -1) AS firstname,
--       CONCAT(If(  length(displayName) - length(replace(displayName, ' ', ''))>1,
-- 		  CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 2), ' ', -1), ' '), ''),
--       SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 3), ' ', -1)) AS lastname,
--       email as mail,
--       country,
--       area as zone,
--       seniority,
--       store as work_location
--       FROM users
--   ) as infos;

DROP TABLE IF EXISTS session;
CREATE TABLE "session" (
  "sid"    VARCHAR      NOT NULL PRIMARY KEY,
  "sess"   JSON         NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
)
WITH (OIDS = FALSE);

DROP TABLE IF EXISTS clients;
CREATE TABLE clients (
  id            SERIAL PRIMARY KEY,
  client_id     TEXT NOT NULL,
  name          TEXT,
  client_secret TEXT NOT NULL,
  redirect_uri  TEXT NOT NULL
);

SELECT
  CONCAT('INSERT INTO users (
    "displayname",
    "username",
    "lastname",
    "firstname",
    "mail",
    "country",
    "zone",
    "seniority",
    "work_location")
    values (''', infos.displayname, ''', ''', lower(replace(CONCAT(LEFT(infos.firstname , 1), infos.lastname) , ' ','')), ''', ''', infos.lastname, ''', ''', infos.firstname, ''', ''', infos.mail, ''', ''', ifnull(infos.country, ''), ''', ''', ifnull(infos.zone, ''), ''', ''', ifnull(infos.seniority, ''), ''', ''', ifnull(infos.work_location, ''), ''');')
from (SELECT
      id,
      displayName as displayname,
      SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 1), ' ', -1) AS firstname,
      CONCAT(If(  length(displayName) - length(replace(displayName, ' ', ''))>1,
		  CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 2), ' ', -1), ' '), ''),
      SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 3), ' ', -1)) AS lastname,
      email as mail,
      country,
      area as zone,
      seniority,
      store as work_location
      FROM users
) as infos;

DROP TABLE IF EXISTS grant_type;
CREATE TABLE grant_type (
  id         SERIAL PRIMARY KEY,
  grant_type TEXT NOT NULL
);
INSERT INTO public.grant_type (id, grant_type) VALUES (1, 'authorization_code');
INSERT INTO public.grant_type (id, grant_type) VALUES (2, 'password');
INSERT INTO public.grant_type (id, grant_type) VALUES (3, 'implicit');
INSERT INTO public.grant_type (id, grant_type) VALUES (4, 'client_credential');

DROP TABLE IF EXISTS authorization_type;
CREATE TABLE authorization_type (
  id            SERIAL PRIMARY KEY,
  client_id     INT REFERENCES clients (id),
  grant_type_id INT REFERENCES grant_type (id)
);

DROP TABLE IF EXISTS authorization_codes;
CREATE TABLE authorization_codes (
  id        SERIAL PRIMARY KEY,
  code      TEXT                        NOT NULL,
  client_id INT                         NOT NULL REFERENCES clients (id),
  user_id   INT                        NOT NULL REFERENCES users (id),
  expires   TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

DROP TABLE IF EXISTS refresh_tokens;
CREATE TABLE refresh_tokens (
  id            SERIAL PRIMARY KEY,
  refresh_token TEXT                        NOT NULL,
  client_id     INT                         NOT NULL REFERENCES clients (id),
  user_id       INT REFERENCES users (id)   NOT NULL REFERENCES users (id),
  expires       TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

--
-- Name: oauth_access_tokens; Type: TABLE; Schema: public; Owner: -; Tablespace:
--
DROP TABLE IF EXISTS access_tokens;
CREATE TABLE access_tokens (
  id           SERIAL PRIMARY KEY,
  access_token TEXT                        NOT NULL,
  client_id    INT                         NOT NULL REFERENCES clients (id),
  user_id      INT                         NOT NULL REFERENCES users (id),
  expires      TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

DROP FUNCTION if exists getRequestsForIdUpdate(text[]);
CREATE OR REPLACE FUNCTION getRequestsForIdUpdate(emails text[])
    RETURNS text AS
$$
DECLARE
    strresult text;
    nb_emails int;
    user_id int;
BEGIN
    RAISE NOTICE 'Emails are %, length %', emails, array_length(emails, 1);
    strresult := '';
    nb_emails := array_length(emails, 1);
    IF nb_emails > 0 THEN
      FOR i IN 1 .. nb_emails LOOP
	      EXECUTE 'SELECT id FROM users WHERE mail = $1'
		    INTO user_id
		    USING emails[i];
	      IF user_id IS NULL
	      THEN
	        RAISE NOTICE 'user % not found', emails[i];
	      ELSE
	        RAISE NOTICE 'id for % : %', emails[i], user_id;
	        strresult := strresult || 'update users set id = ' || user_id || ' where email = ''' || emails[i] || ''';' || E'\r\n';
	      END IF;
      END LOOP;
    END IF;
    RETURN strresult;
END;
$$
LANGUAGE 'plpgsql' IMMUTABLE;

--select getRequestsForIdUpdate(ARRAY['asudre@xebia.fr', 'akinsella@xebia.fr', 'fmirault@xebia.fr']);
