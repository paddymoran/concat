CREATE SEQUENCE public.sign_results_id_seq
  INCREMENT 1
  MINVALUE 1
  MAXVALUE 9223372036854775807
  START 10
  CACHE 1;

  ALTER TABLE ONLY sign_results ALTER COLUMN sign_result_id SET DEFAULT nextval('sign_results_id_seq'::regclass);