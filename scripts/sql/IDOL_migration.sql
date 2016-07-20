SELECT
  CONCAT('INSERT INTO users (
    "displayname",
    "username",
    "lastname",
    "firstname",
    "email",
    "country",
    "zone",
    "seniority",
    "work_location")
    values (''', infos.displayname, ''', ''', lower(replace(CONCAT(LEFT(infos.firstname , 1), infos.lastname) , ' ','')), ''', ''', infos.lastname, ''', ''', infos.firstname, ''', ''', infos.email, ''', ''', ifnull(infos.country, ''), ''', ''', ifnull(infos.zone, ''), ''', ''', ifnull(infos.seniority, ''), ''', ''', ifnull(infos.work_location, ''), ''');')
  from (SELECT
      id,
      displayName as displayname,
      SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 1), ' ', -1) AS firstname,
      CONCAT(If(  length(displayName) - length(replace(displayName, ' ', ''))>1,
		  CONCAT(SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 2), ' ', -1), ' '), ''),
      SUBSTRING_INDEX(SUBSTRING_INDEX(displayName, ' ', 3), ' ', -1)) AS lastname,
      email as email,
      country,
      area as zone,
      seniority,
      store as work_location
      FROM users
  ) as infos;

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
	      EXECUTE 'SELECT id FROM users WHERE email = $1'
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

-- example : select getRequestsForIdUpdate(ARRAY['asudre@xebia.fr', 'akinsella@xebia.fr', 'fmirault@xebia.fr']);
DROP TABLE IF EXISTS users_live;
CREATE TABLE users_live (
  id int,
  email varchar(255) NOT NULL,
  doesExist boolean default true
);

-- EXECUTE this request on live to get all emails :
mysql -e "select concat('INSERT INTO users_live values(', users.id, ', \'', users.email, '\');') as toinsert from users" -h host --default-character-set=utf8mb4 -u user -ppassword database > dump-test.sql

update users set id = id + 40000;

DROP FUNCTION if exists updateIds();
CREATE OR REPLACE FUNCTION updateIds()
    RETURNS VOID
AS
$$
DECLARE
	user_rec users_live%rowtype;
	user_id int;
BEGIN
   FOR user_rec IN
        SELECT *
          FROM users_live
   LOOP
   	RAISE NOTICE 'record : %', user_rec.email;
	  EXECUTE 'SELECT id FROM users WHERE email = $1'
	    INTO user_id
	    USING user_rec.email;
	  IF user_id IS NULL
	  THEN
	    update users_live set doesexist = false where email = user_rec.email;
	    RAISE NOTICE 'user % not found', user_rec.email;
	  ELSE
	    RAISE NOTICE 'id for % : %', user_rec.email, user_rec.id;
	    update users set id = user_rec.id
	    where email = user_rec.email;
	  END IF;
   END LOOP;
END;
$$
LANGUAGE 'plpgsql' VOLATILE;

update users set id = id - 40000 where id > 40000;
