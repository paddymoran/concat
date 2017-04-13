CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE signatures RENAME COLUMN id TO signature_id;

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    shadow BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (user_id) SELECT DISTINCT user_id from signatures;

ALTER TABLE signatures ADD CONSTRAINT signatures_user_id_fk FOREIGN KEY (user_id)
    REFERENCES users (user_id) MATCH SIMPLE
    ON UPDATE NO ACTION ON DELETE NO ACTION;

CREATE TABLE document_sets (
    document_set_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER,
    
    CONSTRAINT document_sets_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE document_data (
    document_data_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    data BYTEA
);

CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_set_id UUID,
    document_data_id UUID,
    filename TEXT,
    hash TEXT,
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT documents_document_set_id_fk FOREIGN KEY (document_set_id)
        REFERENCES document_sets (document_set_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    
    CONSTRAINT documents_document_data_id_fk FOREIGN KEY (document_data_id)
        REFERENCES document_data (document_data_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE sign_requests (
    sign_request_id INTEGER PRIMARY KEY,
    document_id UUID,
    user_id INTEGER,
    field_data JSONB,

    CONSTRAINT sign_requests_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT sign_requests_document_id_fk FOREIGN KEY (document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE sign_results (
    sign_result_id INTEGER PRIMARY KEY,
    user_id INTEGER,
    input_document_id UUID,
    result_document_id UUID,
    field_data JSONB,

    CONSTRAINT sign_results_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT sign_results_input_document_id_fk FOREIGN KEY (input_document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT sign_results_result_document_id_fk FOREIGN KEY (result_document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE access_tokens (
    token TEXT PRIMARY KEY,
    user_id integer,
    document_set_id UUID,
    metadata JSONB,

    CONSTRAINT access_tokens_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT access_tokens_document_set_id_fk FOREIGN KEY (document_set_id)
        REFERENCES document_sets (document_set_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);