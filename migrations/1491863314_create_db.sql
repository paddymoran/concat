CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE TABLE users (
    user_id INTEGER PRIMARY KEY,
    name TEXT,
    email TEXT,
    shadow BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (user_id) SELECT DISTINCT user_id from signatures;

ALTER TABLE signatures ADD CONSTRAINT signatures_user_id_fk FOREIGN KEY (user_id) REFERENCES users (user_id)
 MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION;

CREATE TABLE document_sets (
    set_id UUID DEFAULT gen_random_uuid(),
    user_id INTEGER,
    CONSTRAINT document_set_pk PRIMARY KEY (set_id),
    CONSTRAINT document_sets_user_id_fk FOREIGN KEY (user_id) REFERENCES users (user_id)
        MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE documents (
    document_id UUID DEFAULT gen_random_uuid(),
    user_id INTEGER,
    filename TEXT,
    hash TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT documents_pk PRIMARY KEY (document_id),
    CONSTRAINT documents_user_id_fk FOREIGN KEY (user_id) REFERENCES users (user_id)
        MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE document_set_mapper (
    document_id UUID,
    set_id UUID,
    CONSTRAINT document_set_mapper_document_id_fk FOREIGN KEY (set_id)
        REFERENCES document_sets (set_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,
    CONSTRAINT document_set_mapper_id_fk FOREIGN KEY (set_id)
        REFERENCES document_sets (set_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);


CREATE TABLE document_data (
    document_id UUID,
    data BYTEA,
    CONSTRAINT document_data_document_id_fk FOREIGN KEY (document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE sign_requests (
    sign_request_id INTEGER PRIMARY KEY,
    document_id UUID,
    user_id INTEGER,
    field_data JSONB,

    CONSTRAINT sign_requests_user_id_fk FOREIGN KEY (user_id) REFERENCES users (user_id)
        MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT sign_requests_document_id_fk FOREIGN KEY (document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);


CREATE TABLE sign_results (
    sign_request_id INTEGER,
    input_document_id UUID,
    result_document_id UUID,
    field_data JSONB,

    CONSTRAINT sign_results_sign_request_id_fk FOREIGN KEY (sign_request_id)
        REFERENCES sign_requests (sign_request_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT sign_results_input_document_id_fk FOREIGN KEY (input_document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,

    CONSTRAINT sign_results_result_document_id_fk FOREIGN KEY (result_document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);



CREATE TABLE access_tokens (
    token TEXT,
    user_id integer,
    set_id UUID,
    metadata JSONB,
    CONSTRAINT access_tokens_pk PRIMARY KEY (token),

    CONSTRAINT access_tokens_user_id_fk FOREIGN KEY (user_id)
        REFERENCES users (user_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION,


    CONSTRAINT access_tokens_id_fk FOREIGN KEY (set_id)
        REFERENCES document_sets (set_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION

);