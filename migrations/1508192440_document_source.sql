CREATE TYPE document_source AS ENUM ('uploaded', 'gc');


ALTER TABLE documents ADD COLUMN source document_source default 'uploaded';
