ALTER TABLE users
ADD job TEXT;

ALTER TABLE users
ADD event TEXT;

ALTER TABLE users
ADD created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users
ADD updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users
ADD flag_live TEXT;

ALTER TABLE users
ADD flag_learning TEXT;

ALTER TABLE users
RENAME COLUMN uniqueID TO unique_id;

ALTER TABLE users
DROP COLUMN windows_account;
