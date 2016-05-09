DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  username        TEXT NOT NULL,
  lastname        TEXT NOT NULL,
  firstname       TEXT NOT NULL,
  displayname     TEXT NOT NULL,
  mail            TEXT NOT NULL,
  country         TEXT,
  zone            TEXT,
  seniority       TEXT,
  work_location   TEXT,
  windows_account TEXT,
  uniqueID        TEXT
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

select getRequestsForIdUpdate(ARRAY['asudre@xebia.fr', 'akinsella@xebia.fr', 'fmirault@xebia.fr']);

-- ACTIVITIES
DELETE from activities where id in (
  SELECT a.id FROM (
	  SELECT DISTINCT activities.id
	  FROM activities LEFT JOIN users ON activities.actorId=users.id
	  WHERE users.id IS NULL
  ) AS a
);

ALTER TABLE activities
ADD CONSTRAINT fk_userId_activities
FOREIGN KEY (actorId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- ALTER TABLE activities DROP foreign key fk_userId_activities

-- LIKES
DELETE from likes where id in (
  SELECT l.id FROM (
	  SELECT DISTINCT likes.id
	  FROM likes LEFT JOIN users ON likes.userId=users.id
	  WHERE users.id IS NULL
  ) AS l
);

ALTER TABLE likes
ADD CONSTRAINT fk_userId_likes
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- COMMENTS
DELETE from comments where id in (
  SELECT c.id FROM (
	  SELECT DISTINCT comments.id
	  FROM comments LEFT JOIN users ON comments.userId=users.id
	  WHERE users.id IS NULL
  ) AS c
);

ALTER TABLE comments
ADD CONSTRAINT fk_userId_comments
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- DEVICES
DELETE from devices where id in (
  SELECT d.id FROM (
	  SELECT DISTINCT devices.id
	  FROM devices LEFT JOIN users ON devices.userId=users.id
	  WHERE users.id IS NULL
  ) AS d
);

ALTER TABLE devices
ADD CONSTRAINT fk_userId_devices
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- FAVORITES
DELETE from favorites where id in (
  SELECT f.id FROM (
	  SELECT DISTINCT favorites.id
	  FROM favorites LEFT JOIN users ON favorites.userId=users.id
	  WHERE users.id IS NULL
  ) AS f
);

ALTER TABLE favorites
ADD CONSTRAINT fk_userId_favorites
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- FILTERS
DELETE from filters where id in (
  SELECT f.id FROM (
	  SELECT DISTINCT filters.id
	  FROM filters LEFT JOIN users ON filters.userId=users.id
	  WHERE users.id IS NULL
  ) AS f
);

ALTER TABLE filters
ADD CONSTRAINT fk_userId_filters
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- MEDIA
DELETE from media where id in (
  SELECT m.id FROM (
	  SELECT DISTINCT media.id
	  FROM media LEFT JOIN users ON media.userId=users.id
	  WHERE users.id IS NULL
  ) AS m
);

ALTER TABLE media
ADD CONSTRAINT fk_userId_media
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- POSTS
DELETE from posts where id in (
  SELECT p.id FROM (
	  SELECT DISTINCT posts.id
	  FROM posts LEFT JOIN users ON posts.userId=users.id
	  WHERE users.id IS NULL
  ) AS p
);

ALTER TABLE posts
ADD CONSTRAINT fk_userId_posts
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;

-- PUSH_EVENTS
DELETE from push_events where id in (
  SELECT p.id FROM (
	  SELECT DISTINCT push_events.id
	  FROM push_events LEFT JOIN users ON push_events.userId=users.id
	  WHERE users.id IS NULL
  ) AS p
);

ALTER TABLE push_events
ADD CONSTRAINT fk_userId_push_events
FOREIGN KEY (userId)
REFERENCES users(id)
ON UPDATE CASCADE;
