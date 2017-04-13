--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.2
-- Dumped by pg_dump version 9.6.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
    user_id integer
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
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE migrations (
    name text
);


--
-- Name: sign_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE sign_requests (
    sign_request_id integer NOT NULL,
    document_id uuid,
    user_id integer,
    field_data jsonb
);


--
-- Name: sign_results; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE sign_results (
    sign_result_id integer NOT NULL,
    user_id integer,
    input_document_id uuid,
    result_document_id uuid,
    field_data jsonb
);


--
-- Name: signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE signatures (
    signature_id integer NOT NULL,
    user_id integer NOT NULL,
    signature bytea NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    deleted boolean DEFAULT false NOT NULL
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
-- Name: signatures signature_id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY signatures ALTER COLUMN signature_id SET DEFAULT nextval('signatures_id_seq'::regclass);


--
-- Name: access_tokens access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY access_tokens
    ADD CONSTRAINT access_tokens_pkey PRIMARY KEY (token);


--
-- Name: document_data document_data_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_data
    ADD CONSTRAINT document_data_pkey PRIMARY KEY (document_data_id);


--
-- Name: document_sets document_sets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_sets
    ADD CONSTRAINT document_sets_pkey PRIMARY KEY (document_set_id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (document_id);


--
-- Name: sign_requests sign_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_pkey PRIMARY KEY (sign_request_id);


--
-- Name: sign_results sign_results_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_pkey PRIMARY KEY (sign_result_id);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (signature_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: access_tokens access_tokens_document_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY access_tokens
    ADD CONSTRAINT access_tokens_document_set_id_fk FOREIGN KEY (document_set_id) REFERENCES document_sets(document_set_id);


--
-- Name: access_tokens access_tokens_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY access_tokens
    ADD CONSTRAINT access_tokens_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: document_sets document_sets_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY document_sets
    ADD CONSTRAINT document_sets_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: documents documents_document_data_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_document_data_id_fk FOREIGN KEY (document_data_id) REFERENCES document_data(document_data_id);


--
-- Name: documents documents_document_set_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_document_set_id_fk FOREIGN KEY (document_set_id) REFERENCES document_sets(document_set_id);


--
-- Name: sign_requests sign_requests_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_document_id_fk FOREIGN KEY (document_id) REFERENCES documents(document_id);


--
-- Name: sign_requests sign_requests_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_requests
    ADD CONSTRAINT sign_requests_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: sign_results sign_results_input_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_input_document_id_fk FOREIGN KEY (input_document_id) REFERENCES documents(document_id);


--
-- Name: sign_results sign_results_result_document_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_result_document_id_fk FOREIGN KEY (result_document_id) REFERENCES documents(document_id);


--
-- Name: sign_results sign_results_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY sign_results
    ADD CONSTRAINT sign_results_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- Name: signatures signatures_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY signatures
    ADD CONSTRAINT signatures_user_id_fk FOREIGN KEY (user_id) REFERENCES users(user_id);


--
-- PostgreSQL database dump complete
--

