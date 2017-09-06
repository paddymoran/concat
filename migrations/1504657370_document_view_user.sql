ALTER TABLE document_view ADD user_id INTEGER;

ALTER TABLE document_view ADD CONSTRAINT document_view_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION;


ALTER TABLE document_view DROP CONSTRAINT document_view_pkey;
DELETE FROM document_view;
ALTER TABLE document_view ADD CONSTRAINT document_view_pkey PRIMARY KEY (document_id, user_id);