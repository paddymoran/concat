alter table documents
drop constraint documents_document_data_id_fk ,
add CONSTRAINT documents_document_data_id_fk FOREIGN KEY (document_data_id)
     REFERENCES public.document_data (document_data_id) MATCH SIMPLE;


alter table documents add column deleted_at timestamp without time zone;
alter table document_sets add column deleted_at timestamp without time zone;