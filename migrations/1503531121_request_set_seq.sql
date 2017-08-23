CREATE SEQUENCE public.sign_requests_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 10
  CACHE 1;

  ALTER TABLE ONLY sign_requests ALTER COLUMN sign_request_id SET DEFAULT nextval('sign_requests_id_seq'::regclass);