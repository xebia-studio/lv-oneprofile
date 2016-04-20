DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  username        TEXT NOT NULL,
  lastname        TEXT NOT NULL,
  firstname       TEXT NOT NULL,
  mail            TEXT NOT NULL,
  country         TEXT,
  zone            TEXT,
  seniority       TEXT,
  work_location   TEXT,
  windows_account TEXT,
  uniqueID        TEXT
);
