CREATE EXTENSION IF NOT EXISTS pgcrypto;


CREATE SEQUENCE public.signatures_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 1
  CACHE 1;


CREATE TABLE public.users
(
  user_id integer NOT NULL,
  name text,
  email text,
  shadow boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (user_id)
);


CREATE TABLE public.signatures
(
  id integer NOT NULL DEFAULT nextval('signatures_id_seq'::regclass),
  user_id integer NOT NULL,
  signature bytea NOT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  deleted boolean NOT NULL DEFAULT false,
  CONSTRAINT signatures_pkey PRIMARY KEY (id),
  CONSTRAINT signatures_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.document_sets
(
  set_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id integer,
  CONSTRAINT document_set_pk PRIMARY KEY (set_id),
  CONSTRAINT document_sets_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.documents
(
  document_id uuid NOT NULL DEFAULT gen_random_uuid(),
  set_id uuid,
  filename text,
  hash text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT documents_pk PRIMARY KEY (document_id),
  CONSTRAINT document_sets_id_fk FOREIGN KEY (set_id)
      REFERENCES public.document_sets (set_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE public.document_data
(
  document_id uuid,
  data bytea,
  CONSTRAINT document_data_document_id_fk FOREIGN KEY (document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);
CREATE TABLE public.sign_requests
(
  sign_request_id integer NOT NULL,
  document_id uuid,
  user_id integer,
  field_data jsonb,
  CONSTRAINT sign_requests_pkey PRIMARY KEY (sign_request_id),
  CONSTRAINT sign_requests_document_id_fk FOREIGN KEY (document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT sign_requests_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.sign_results
(
  sign_request_id integer,
  input_document_id uuid,
  result_document_id uuid,
  field_data jsonb,
  CONSTRAINT sign_results_input_document_id_fk FOREIGN KEY (input_document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT sign_results_result_document_id_fk FOREIGN KEY (result_document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT sign_results_sign_request_id_fk FOREIGN KEY (sign_request_id)
      REFERENCES public.sign_requests (sign_request_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE TABLE public.access_tokens
(
  token text NOT NULL,
  user_id integer,
  set_id uuid,
  metadata jsonb,
  CONSTRAINT access_tokens_pk PRIMARY KEY (token),
  CONSTRAINT access_tokens_id_fk FOREIGN KEY (set_id)
      REFERENCES public.document_sets (set_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT access_tokens_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);