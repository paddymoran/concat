CREATE SEQUENCE public.document_meta_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 17
  CACHE 1;

CREATE TABLE document_meta (
    document_meta_id integer NOT NULL DEFAULT nextval('document_meta_id_seq'::regclass),
    document_id UUID,
    field_data JSONB,
    CONSTRAINT document_meta_pkey PRIMARY KEY (document_meta_id),
    CONSTRAINT document_meta_document_id_fk FOREIGN KEY (document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);