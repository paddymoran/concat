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
-- Name: signature_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE signature_type AS ENUM (
    'signature',
    'date',
    'initial',
    'text'
);


--
-- Name: delete_document(integer, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION delete_document(user_id integer, document_id uuid) RETURNS void
    LANGUAGE sql
    AS $_$
DELETE FROM document_data dd
USING documents d 
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
WHERE d.document_data_id = dd.document_data_id and user_id = $1 AND document_id = $2 ;

$_$;


--
-- Name: document_hash(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION document_hash() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.hash = encode(digest(data, 'sha256'), 'hex') FROM document_data WHERE document_data_id = NEW.document_data_id;
    RETURN NEW;
END $$;


--
-- Name: document_set_json(uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION document_set_json(uuid) RETURNS json
    LANGUAGE sql
    AS $_$
WITH RECURSIVE docs(document_id, prev_id, original_id, document_set_id, generation) as (
    SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
    FROM documents t
    UNION
   SELECT result_document_id, input_document_id,original_id, document_set_id, generation + 1
    FROM sign_results tt, docs t
    WHERE t.document_id = tt.input_document_id
)
    SELECT row_to_json(qqq) FROM (
        SELECT
            $1 as document_set_id,
             ds.name as name, ds.created_at as created_at,
            array_to_json(array_agg(row_to_json(qq))) as documents
	    FROM (
		    SELECT d.document_id, filename, created_at, versions
		    FROM (
			    SELECT
			    DISTINCT last_value(document_id) over wnd AS document_id, array_agg(document_id) OVER wnd as versions
			    FROM docs
			    WHERE document_set_id = $1
			    WINDOW wnd AS (
			       PARTITION BY original_id ORDER BY generation ASC
			       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
			    )
	    ) q
	    JOIN documents d on d.document_id = q.document_id
	    ) qq
	    JOIN document_sets ds ON ds.document_set_id = $1
	    GROUP BY ds.name, ds.created_at
 ) qqq

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
    'document_id', sr.document_id,
    'filename', d.filename,
    'sign_request_id', sr.sign_request_id,
    'prompts', sr.field_data,
    'created_at', d.created_at,
    'sign_status', CASE WHEN srr.sign_result_id IS NOT NULL THEN 'Signed' ELSE 'Pending' END
    )) as documents,
    d.document_set_id, ds.name, ds.created_at, u.name as "requester", u.user_id
FROM sign_requests sr
JOIN documents d ON d.document_id = sr.document_id
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
JOIN users u ON u.user_id = ds.user_id
LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
WHERE sr.user_id = $1

GROUP BY d.document_set_id, ds.name, ds.created_at, u.name, u.user_id
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
-- Name: document_sets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE document_sets (
    document_set_id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id integer,
    name text,
    created_at timestamp without time zone DEFAULT now()
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
    created_at timestamp without time zone DEFAULT now(),
    order_index integer DEFAULT 0
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
    sign_request_id integer
);


--
-- Name: signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE signatures (
    signature_id integer NOT NULL,
    user_id integer NOT NULL,
    signature bytea NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
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
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE users (
    user_id integer NOT NULL,
    name text,
    email text,
    shadow boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
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
-- Name: document_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_sets
    ADD CONSTRAINT document_sets_pkey PRIMARY KEY (document_set_id);


--
-- Name: documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


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
-- Name: document_sets_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_sets
    ADD CONSTRAINT document_sets_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: documents_document_data_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_document_data_id_fk FOREIGN KEY (document_data_id) REFERENCES document_data(document_data_id) ON DELETE CASCADE;


--
-- Name: documents_document_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_document_set_id_fk FOREIGN KEY (document_set_id) REFERENCES document_sets(document_set_id);


--
-- Name: sign_requests_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_document_id_fk FOREIGN KEY (document_id) REFERENCES documents(document_id);


--
-- Name: sign_requests_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: sign_results_input_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_input_document_id_fk FOREIGN KEY (input_document_id) REFERENCES documents(document_id);


--
-- Name: sign_results_result_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_result_document_id_fk FOREIGN KEY (result_document_id) REFERENCES documents(document_id);


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
-- PostgreSQL database dump complete
--

