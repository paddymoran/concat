CREATE TABLE document_view (
    document_id INTEGER PRIMARY KEY,
    field_data JSONB,

    CONSTRAINT document_view_document_id_fk FOREIGN KEY (document_id)
        REFERENCES documents (document_id) MATCH SIMPLE
        ON UPDATE NO ACTION ON DELETE NO ACTION
);