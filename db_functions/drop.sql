DROP TRIGGER IF EXISTS document_hash_trigger ON public.documents;
DROP FUNCTION IF EXISTS format_iso_date(d timestamp with time zone);
DROP FUNCTION IF EXISTS request_info(uuid);
DROP FUNCTION IF EXISTS document_hash();
DROP FUNCTION IF EXISTS delete_document(user_id integer, document_id uuid);
DROP FUNCTION IF EXISTS delete_document_set_if_empty(user_id integer, document_set_id uuid);
DROP FUNCTION IF EXISTS revoke_signature_request(user_id integer, integer);
DROP FUNCTION IF EXISTS document_set_json(user_id integer, uuid);
DROP FUNCTION IF EXISTS latest_document_id(uuid);
DROP FUNCTION IF EXISTS subsequent_document_ids(uuid);
DROP FUNCTION IF EXISTS original_document_id(uuid);
DROP FUNCTION IF EXISTS signed_by(text);

DROP FUNCTION IF EXISTS signature_requests(user_id integer);
DROP FUNCTION IF EXISTS latest_document_id(uuid);
DROP FUNCTION IF EXISTS document_set_status(uuid);
DROP FUNCTION IF EXISTS document_status(uuid);
DROP FUNCTION IF EXISTS add_merged_file(bytea, uuid[]);

DROP FUNCTION IF EXISTS usage(user_id integer, default_amount_per_unit integer, default_unit text);

DROP TYPE IF EXISTS signature_type CASCADE;
DROP TABLE IF EXISTS public.merge_map;
DROP TABLE IF EXISTS public.user_usage_limits;
DROP TABLE IF EXISTS public.document_view;
DROP TABLE IF EXISTS public.signatures;



DROP TABLE IF EXISTS public.user_meta;
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
DROP TYPE IF EXISTS document_source;
