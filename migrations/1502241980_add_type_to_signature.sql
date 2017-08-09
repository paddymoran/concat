CREATE TYPE signature_type AS ENUM ('signature', 'date', 'initial', 'text');

ALTER table signatures
    ADD COLUMN type signature_type
    DEFAULT 'signature';