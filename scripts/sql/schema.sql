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
