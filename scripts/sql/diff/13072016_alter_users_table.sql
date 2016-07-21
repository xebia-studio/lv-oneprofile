ALTER TABLE users
RENAME COLUMN mail TO email;

update users set seniority = concat(trim(to_char(to_timestamp(seniority, 'YYYY-MM-DD'), 'Month')), ' ', to_char(to_timestamp(seniority, 'YYYY-MM-DD'), 'YYYY'));

