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

-- example : select getRequestsForIdUpdate(ARRAY['asudre@xebia.fr', 'akinsella@xebia.fr', 'fmirault@xebia.fr']);
