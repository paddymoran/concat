ALTER TABLE document_meta DROP CONSTRAINT document_meta_document_id_fk;
ALTER TABLE document_meta DROP COLUMN document_id;
ALTER TABLE document_meta ADD COLUMN document_set_id UUID;
ALTER TABLE document_meta ADD CONSTRAINT document_meta_document_set_id_fk FOREIGN KEY (document_set_id)
        REFERENCES document_sets (document_set_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION;

