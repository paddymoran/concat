DROP TRIGGER IF EXISTS document_hash_trigger ON public.documents;
DROP FUNCTION IF EXISTS document_hash();
DROP FUNCTION IF EXISTS  delete_document(user_id integer, document_id uuid);
DROP FUNCTION IF EXISTS  document_set_json(uuid);
DROP FUNCTION IF EXISTS  delete_document(user_id integer, document_id uuid);
DROP FUNCTION IF EXISTS  signature_requests(user_id integer);

DROP TYPE IF EXISTS signature_type CASCADE;

DROP TABLE IF EXISTS public.document_view;
DROP TABLE IF EXISTS public.signatures;



DROP TABLE IF EXISTS public.sign_results;

DROP TABLE IF EXISTS public.sign_requests;

DROP TABLE IF EXISTS  public.access_tokens;

DROP TABLE IF EXISTS public.document_set_mapper;

DROP TABLE IF EXISTS public.documents;

DROP TABLE IF EXISTS  public.document_sets;
DROP TABLE IF EXISTS public.document_data;
DROP SEQUENCE IF EXISTS public.signatures_id_seq;
DROP SEQUENCE IF EXISTS public.sign_results_id_seq;
DROP SEQUENCE IF EXISTS public.sign_requests_id_seq;

DROP TABLE IF EXISTS public.users;

DROP TABLE IF EXISTS public.migrations;
