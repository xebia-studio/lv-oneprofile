ALTER TABLE users
RENAME COLUMN mail TO email;

ALTER TABLE users
ADD password TEXT;

ALTER TABLE users
ADD token TEXT;

ALTER TABLE users
ADD description TEXT;

ALTER TABLE users
ADD phone TEXT;

ALTER TABLE users
ADD resetToken TEXT;

ALTER TABLE users
ADD resetDemandExpirationDate TEXT;

update users set seniority = concat(trim(to_char(to_timestamp(seniority, 'YYYY-MM-DD'), 'Month')), ' ', to_char(to_timestamp(seniority, 'YYYY-MM-DD'), 'YYYY'));

