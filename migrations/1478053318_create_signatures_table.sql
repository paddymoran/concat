CREATE TABLE IF NOT EXISTS signatures (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL,
    signature    BYTEA NOT NULL,
    created_at   TIMESTAMP NOT NULL DEFAULT now(),
    deleted      BOOLEAN NOT NULL DEFAULT false
)
