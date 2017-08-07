alter table documents
drop constraint documents_document_data_id_fk ,
add CONSTRAINT documents_document_data_id_fk FOREIGN KEY (document_data_id)
     REFERENCES public.document_data (document_data_id) MATCH SIMPLE
   on delete cascade;