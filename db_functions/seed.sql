--
-- PostgreSQL database dump
--

-- Dumped from database version 9.5.5
-- Dumped by pg_dump version 9.5.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET search_path = public, pg_catalog;

--
-- Name: document_source; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE document_source AS ENUM (
    'uploaded',
    'gc'
);


--
-- Name: signature_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE signature_type AS ENUM (
    'signature',
    'date',
    'initial',
    'text'
);


--
-- Name: add_merged_file(bytea, uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION add_merged_file(data bytea, document_ids uuid[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    data_hash text;
    document_id uuid;
BEGIN

    data_hash := encode(digest(data, 'sha256'), 'hex');
    DELETE FROM merge_map WHERE hash = data_hash;
     FOREACH document_id IN ARRAY document_ids
    LOOP
       INSERT INTO merge_map (hash, document_id) VALUES (data_hash, document_id);
    END LOOP;
END
$$;


--
-- Name: delete_document(integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION delete_document(user_id integer, document_id uuid) RETURNS uuid
    LANGUAGE plpgsql
    AS $_$
DECLARE
    start_id uuid;
    result_document_set_id uuid;
    user_id integer;
    loop_id uuid;
    data_id uuid;
BEGIN
    start_id := (SELECT original_document_id($2));
    result_document_set_id := (SELECT d.document_set_id FROM documents d WHERE d.document_id = start_id);
    user_id := (SELECT ds.user_id FROM document_sets ds WHERE ds.document_set_id = result_document_set_id);
    IF user_id != $1 THEN RETURN NULL; END IF;
    FOR loop_id IN (SELECT subsequent_document_ids(start_id)) LOOP
        data_id := (SELECT document_data_id  FROM documents dd WHERE dd.document_id = loop_id);
        UPDATE documents dd SET deleted_at = now(), document_data_id = NULL WHERE dd.document_id = loop_id;
        DELETE FROM document_data dd WHERE dd.document_data_id = data_id;
    END LOOP;
    PERFORM delete_document_set_if_empty($1, result_document_set_id);
    RETURN result_document_set_id;
END
$_$;


--
-- Name: delete_document_set_if_empty(integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION delete_document_set_if_empty(user_id integer, document_set_id uuid) RETURNS void
    LANGUAGE sql
    AS $_$
    UPDATE document_sets ds SET deleted_at = now()
    WHERE user_id = $1 AND ds.document_set_id = $2 AND NOT EXISTS(SELECT * FROM documents WHERE document_set_id = $2 AND deleted_at IS NULL)
    $_$;


--
-- Name: document_hash(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION document_hash() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.hash = encode(digest(data, 'sha256'), 'hex') FROM document_data WHERE document_data_id = NEW.document_data_id;
    NEW.length = octet_length(data) FROM document_data WHERE document_data_id = NEW.document_data_id;
    RETURN NEW;
END $$;


--
-- Name: document_set_json(integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION document_set_json(user_id integer, uuid) RETURNS json
    LANGUAGE sql
    AS $_$
WITH RECURSIVE docs(document_id, prev_id, original_id, document_set_id, generation) as (
    SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
    FROM documents t
    UNION
   SELECT result_document_id, input_document_id,original_id, document_set_id, generation + 1
    FROM sign_results tt, docs t
    WHERE t.document_id = tt.input_document_id AND tt.result_document_id IS NOT NULL
)
    SELECT row_to_json(qqq) FROM (
        SELECT
            $2 as document_set_id,
             ds.name as name, format_iso_date(ds.created_at) as created_at,
            array_to_json(array_agg(row_to_json(qq))) as documents,
            CASE WHEN EVERY(sign_status != 'Pending') THEN 'Complete' ELSE 'Pending' END as status,
            sum(size) as size,
            ds.user_id = $1 as is_owner
        FROM (
            SELECT d.document_id, filename, format_iso_date(created_at), versions, dv.field_data, document_status(start_id) as sign_status,
                d.length as size,
                    q.source as source,
                request_info(start_id) as request_info
            FROM (
                SELECT
                DISTINCT last_value(d.document_id) over wnd AS document_id,
                array_agg(d.document_id) OVER wnd as versions,
                first_value(d.document_id) over wnd as start_id,
                first_value(dd.order_index) OVER wnd as order_index,
                first_value(dd.source) OVER wnd as source
                FROM docs d
                JOIN documents dd on d.document_id = dd.document_id
                WHERE d.document_set_id = $2 and dd.deleted_at IS NULL

                WINDOW wnd AS (
                   PARTITION BY original_id ORDER BY generation ASC
                   ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )

            ) q
            JOIN documents d on d.document_id = q.document_id
            LEFT OUTER JOIN document_view dv ON (d.document_id = dv.document_id and user_id = $1)
            ORDER BY q.order_index ASC

        ) qq
        JOIN document_sets ds ON ds.document_set_id = $2
        GROUP BY ds.name, ds.created_at, ds.user_id

        ORDER BY ds.created_at DESC
 ) qqq
$_$;


--
-- Name: document_set_status(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION document_set_status(uuid) RETURNS text
    LANGUAGE sql
    AS $_$
SELECT CASE WHEN EVERY(document_status(document_id) != 'Pending') THEN 'Complete' ELSE 'Pending' END as status
FROM documents d
WHERE document_set_id = $1
$_$;


--
-- Name: document_status(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION document_status(uuid) RETURNS text
    LANGUAGE sql
    AS $_$
    SELECT CASE
        WHEN (every(sr.sign_request_id is null) and every(srrr.sign_result_id is not null)) THEN 'Complete' -- self signed
        WHEN every(srr.sign_request_id is not null) THEN 'Complete'
        ELSE 'Pending' END as status
    FROM documents d
    LEFT OUTER JOIN sign_requests sr on d.document_id = sr.document_id
    LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
    LEFT OUTER JOIN sign_results srrr on srrr.input_document_id  = d.document_id
    WHERE d.document_id = $1
$_$;


--
-- Name: format_iso_date(timestamp with time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION format_iso_date(d timestamp with time zone) RETURNS text
    LANGUAGE sql
    AS $_$
    SELECT to_char($1 at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
$_$;


--
-- Name: latest_document_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION latest_document_id(uuid) RETURNS uuid
    LANGUAGE sql
    AS $_$
    WITH RECURSIVE docs(document_id, prev_id, original_id, generation) as (
        SELECT t.document_id, null::uuid, t.document_id, 0
        FROM documents t
        WHERE document_id = $1
        UNION
       SELECT result_document_id, input_document_id,original_id, generation + 1
        FROM sign_results tt, docs t
        WHERE t.document_id = tt.input_document_id AND tt.result_document_id IS NOT NULL
    )
    SELECT
    DISTINCT last_value(document_id) over wnd AS document_id
    FROM docs d

    WINDOW wnd AS (
       PARTITION BY original_id ORDER BY generation ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    )
$_$;


--
-- Name: original_document_id(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION original_document_id(uuid) RETURNS uuid
    LANGUAGE sql
    AS $_$
WITH RECURSIVE back_docs(document_id, prev_id, original_id, document_set_id, generation) as (
    SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
    FROM documents t
    WHERE t.document_id = $1
    UNION
   SELECT input_document_id, result_document_id, original_id, document_set_id, generation + 1
    FROM sign_results tt, back_docs t
    WHERE t.document_id = tt.result_document_id
)
SELECT document_id FROM back_docs order by generation DESC limit 1
$_$;


--
-- Name: request_info(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION request_info(uuid) RETURNS json
    LANGUAGE sql
    AS $_$
SELECT json_agg(row_to_json(q)) FROM (
    SELECT
    u.user_id as user_id, name, email, format_iso_date(srr.created_at), sr.sign_request_id,
    CASE
        WHEN srr.accepted THEN 'Signed'
        WHEN NOT srr.accepted THEN 'Rejected'
        ELSE 'Pending'
    END as status,
    CASE WHEN NOT srr.accepted THEN srr.field_data ELSE NULL END as rejection_explaination,
    CASE WHEN srr.accepted THEN srr.field_data->>'acceptedMessage' ELSE NULL END AS accepted_message
    FROM documents d
    LEFT OUTER JOIN sign_requests sr on d.document_id = sr.document_id
    LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
    JOIN public.users u on sr.user_id = u.user_id
    WHERE d.document_id = $1
) q
$_$;


--
-- Name: revoke_signature_request(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION revoke_signature_request(user_id integer, sign_request_id integer) RETURNS void
    LANGUAGE sql
    AS $_$
DELETE FROM sign_requests sr
USING documents d
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
WHERE d.document_id = sr.document_id and ds.user_id = $1 AND sr.sign_request_id = $2 ;
$_$;


--
-- Name: signature_requests(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION signature_requests(user_id integer) RETURNS json
    LANGUAGE sql
    AS $_$
SELECT json_agg(row_to_json(q)) as "signature_requests"
FROM (
SELECT json_agg(
    json_build_object(
    'original_document_id', sr.document_id,
    'document_id', latest_document_id(sr.document_id),
    'filename', d.filename,
    'sign_request_id', sr.sign_request_id,
    'prompts', sr.field_data,
    'created_at', format_iso_date(d.created_at),
    'size',  d.length,
    'sign_status', document_status(sr.document_id),
    'rejection_explaination', CASE WHEN NOT srr.accepted THEN srr.field_data ELSE NULL END ,
    'accepted_message', CASE WHEN srr.accepted THEN srr.field_data->>'acceptedMessage' ELSE NULL END,
    'request_status', CASE WHEN srr.sign_result_id IS NOT NULL
        THEN CASE WHEN srr.accepted = True THEN 'Signed' ELSE 'Rejected' END
        ELSE 'Pending' END
    ) ORDER BY d.order_index ASC) as documents,
    d.document_set_id, ds.name, format_iso_date(ds.created_at) as created_at, u.name as "requester", u.user_id,  ds.user_id = $1 as is_owner
FROM sign_requests  sr
JOIN documents d ON d.document_id = sr.document_id
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
JOIN users u ON u.user_id = ds.user_id
LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
WHERE sr.user_id = $1 AND d.deleted_at IS NULL and ds.deleted_at IS NULL

GROUP BY d.document_set_id, ds.name, ds.created_at, u.name, u.user_id, ds.user_id
ORDER BY ds.created_at DESC
) q
$_$;


--
-- Name: signed_by(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION signed_by(hash text) RETURNS json
    LANGUAGE sql
    AS $_$
    WITH RECURSIVE back_docs(document_id, prev_id, original_id, document_set_id, generation) as (
        SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
        FROM documents t
        UNION
       SELECT input_document_id, result_document_id, original_id, document_set_id, generation + 1
        FROM sign_results tt, back_docs t
        WHERE t.document_id = tt.result_document_id
    )
    SELECT json_agg(row_to_json(q)) FROM (
        SELECT filename, d.document_id, json_agg(
        json_build_object('name', u.name, 'email', u.email, 'user_id', u.user_id)) as signees
        FROM
        documents d
        LEFT OUTER JOIN merge_map mm on d.document_id = mm.document_id
        JOIN back_docs bd ON d.document_id = bd.original_id
        JOIN sign_results sr ON sr.result_document_id = bd.document_id
        JOIN users u ON sr.user_id = u.user_id
        WHERE
        (d.hash = $1 or mm.hash = $1)
        AND accepted = TRUE
        GROUP BY filename, d.document_id
    ) q
$_$;


--
-- Name: subsequent_document_ids(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION subsequent_document_ids(uuid) RETURNS SETOF uuid
    LANGUAGE sql
    AS $_$
    WITH RECURSIVE docs(document_id, prev_id, original_id, generation) as (
        SELECT t.document_id, null::uuid, t.document_id, 0
        FROM documents t
        WHERE document_id = $1
        UNION
       SELECT result_document_id, input_document_id,original_id, generation + 1
        FROM sign_results tt, docs t
        WHERE t.document_id = tt.input_document_id AND tt.result_document_id IS NOT NULL
    )
    SELECT
    DISTINCT document_id
    FROM docs d
$_$;


--
-- Name: usage(integer, integer, text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION usage(user_id integer, default_amount_per_unit integer, default_unit text) RETURNS TABLE(signed_this_unit integer, requested_this_unit integer, amount_per_unit integer, unit text, max_allowance_reached boolean)
    LANGUAGE sql
    AS $_$

    WITH
    usage_allowance as (
        SELECT
        CASE WHEN subscribed IS TRUE THEN NULL ELSE COALESCE(amount_per_unit, $2) END as amount_per_unit,
        COALESCE(unit, $3) as unit
        FROM public.users u
        LEFT OUTER JOIN user_usage_limits uul ON uul.user_id = u.user_id
        WHERE u.user_id = $1
        LIMIT 1
    ),
    requested_doc_set_ids as (
        SELECT DISTINCT d.document_set_id
        FROM sign_requests sr
        JOIN documents d on d.document_id = sr.document_id
        JOIN document_sets ds on d.document_set_id = ds.document_set_id
        WHERE
        ds.user_id = $1
        AND d.created_at > (now() - ( '1 ' || (SELECT unit FROM usage_allowance) )::INTERVAL)
    ),
    total_signed as (
        SELECT
        count(DISTINCT d.document_set_id)::integer as "signed_this_unit"
        FROM sign_results sr
        JOIN documents d ON d.document_id = sr.input_document_id
        WHERE
        sr.sign_request_id IS NULL
        AND user_id = $1
        AND d.created_at > (now() - ( '1 ' || (SELECT unit FROM usage_allowance) )::INTERVAL)


    ),
    total_requested as (
        SELECT count(document_set_id)::integer as "requested_this_unit"
        FROM requested_doc_set_ids
    )
    SELECT signed_this_unit, requested_this_unit, amount_per_unit, unit, (signed_this_unit + requested_this_unit) >= amount_per_unit as max_allowance_reached
    FROM (
    SELECT
        (SELECT signed_this_unit FROM total_signed),
        (SELECT requested_this_unit FROM total_requested),
        (SELECT  amount_per_unit FROM usage_allowance),
        (SELECT unit FROM usage_allowance)
        ) q
$_$;


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE access_tokens (
    token text NOT NULL,
    user_id integer,
    document_set_id uuid,
    metadata jsonb
);


--
-- Name: document_data; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE document_data (
    document_data_id uuid DEFAULT gen_random_uuid() NOT NULL,
    data bytea
);


--
-- Name: document_meta_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE document_meta_id_seq
    START WITH 17
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: document_meta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE document_meta (
    document_meta_id integer DEFAULT nextval('document_meta_id_seq'::regclass) NOT NULL,
    field_data jsonb,
    document_set_id uuid
);


--
-- Name: document_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE document_sets (
    document_set_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer,
    name text,
    created_at timestamp without time zone DEFAULT now(),
    deleted_at timestamp with time zone
);


--
-- Name: document_view; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE document_view (
    document_id uuid NOT NULL,
    field_data jsonb,
    user_id integer NOT NULL
);


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE documents (
    document_id uuid DEFAULT gen_random_uuid() NOT NULL,
    document_set_id uuid,
    document_data_id uuid,
    filename text,
    hash text,
    created_at timestamp with time zone DEFAULT now(),
    order_index integer DEFAULT 0,
    deleted_at timestamp with time zone,
    length integer,
    source document_source DEFAULT 'uploaded'::document_source
);


--
-- Name: merge_map; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE merge_map (
    hash text NOT NULL,
    document_id uuid NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE migrations (
    name text
);


--
-- Name: sign_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sign_requests_id_seq
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sign_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE sign_requests (
    sign_request_id integer DEFAULT nextval('sign_requests_id_seq'::regclass) NOT NULL,
    document_id uuid,
    user_id integer,
    field_data jsonb
);


--
-- Name: sign_results_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE sign_results_id_seq
    START WITH 10
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: sign_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE sign_results (
    sign_result_id integer DEFAULT nextval('sign_results_id_seq'::regclass) NOT NULL,
    user_id integer,
    input_document_id uuid,
    result_document_id uuid,
    field_data jsonb,
    sign_request_id integer,
    accepted boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE signatures (
    signature_id integer NOT NULL,
    user_id integer NOT NULL,
    signature bytea NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    type signature_type DEFAULT 'signature'::signature_type
);


--
-- Name: signatures_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE signatures_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: signatures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE signatures_id_seq OWNED BY signatures.signature_id;


--
-- Name: user_meta; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE user_meta (
    user_id integer NOT NULL,
    data jsonb
);


--
-- Name: user_usage_limits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE user_usage_limits (
    user_id integer,
    amount_per_unit integer,
    unit text
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    user_id integer NOT NULL,
    name text,
    email text,
    shadow boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    subscribed boolean DEFAULT false,
    email_verified boolean DEFAULT false
);


--
-- Name: signature_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY signatures ALTER COLUMN signature_id SET DEFAULT nextval('signatures_id_seq'::regclass);


--
-- Name: access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY access_tokens
    ADD CONSTRAINT access_tokens_pkey PRIMARY KEY (token);


--
-- Name: document_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_data
    ADD CONSTRAINT document_data_pkey PRIMARY KEY (document_data_id);


--
-- Name: document_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_meta
    ADD CONSTRAINT document_meta_pkey PRIMARY KEY (document_meta_id);


--
-- Name: document_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_sets
    ADD CONSTRAINT document_sets_pkey PRIMARY KEY (document_set_id);


--
-- Name: document_view_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_view
    ADD CONSTRAINT document_view_pkey PRIMARY KEY (document_id, user_id);


--
-- Name: documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- Name: merge_map_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY merge_map
    ADD CONSTRAINT merge_map_pkey PRIMARY KEY (hash, document_id);


--
-- Name: sign_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_pkey PRIMARY KEY (sign_request_id);


--
-- Name: sign_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_pkey PRIMARY KEY (sign_result_id);


--
-- Name: signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (signature_id);


--
-- Name: user_meta_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_meta
    ADD CONSTRAINT user_meta_pkey PRIMARY KEY (user_id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: document_hash_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER document_hash_trigger BEFORE INSERT ON documents FOR EACH ROW EXECUTE PROCEDURE document_hash();


--
-- Name: access_tokens_document_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY access_tokens
    ADD CONSTRAINT access_tokens_document_set_id_fk FOREIGN KEY (document_set_id) REFERENCES document_sets(document_set_id);


--
-- Name: access_tokens_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY access_tokens
    ADD CONSTRAINT access_tokens_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: document_meta_document_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_meta
    ADD CONSTRAINT document_meta_document_set_id_fk FOREIGN KEY (document_set_id) REFERENCES document_sets(document_set_id);


--
-- Name: document_sets_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_sets
    ADD CONSTRAINT document_sets_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: document_view_document_id_fkk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_view
    ADD CONSTRAINT document_view_document_id_fkk FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE;


--
-- Name: document_view_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_view
    ADD CONSTRAINT document_view_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: documents_document_data_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_document_data_id_fk FOREIGN KEY (document_data_id) REFERENCES document_data(document_data_id);


--
-- Name: documents_document_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_document_set_id_fk FOREIGN KEY (document_set_id) REFERENCES document_sets(document_set_id);


--
-- Name: sign_requests_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_document_id_fk FOREIGN KEY (document_id) REFERENCES documents(document_id) ON DELETE CASCADE;


--
-- Name: sign_requests_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: sign_results_input_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_input_document_id_fk FOREIGN KEY (input_document_id) REFERENCES documents(document_id) ON DELETE CASCADE;


--
-- Name: sign_results_result_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_result_document_id_fk FOREIGN KEY (result_document_id) REFERENCES documents(document_id) ON DELETE CASCADE;


--
-- Name: sign_results_sign_request_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_sign_request_id_fk FOREIGN KEY (sign_request_id) REFERENCES sign_requests(sign_request_id) ON DELETE CASCADE;


--
-- Name: sign_results_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: signatures_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY signatures
    ADD CONSTRAINT signatures_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: user_meta_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_meta
    ADD CONSTRAINT user_meta_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: user_usage_limits_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY user_usage_limits
    ADD CONSTRAINT user_usage_limits_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- PostgreSQL database dump complete
--

