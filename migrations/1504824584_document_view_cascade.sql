
alter table document_view
drop constraint document_view_document_id_fk,
add CONSTRAINT document_view_document_id_fkk FOREIGN KEY (document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
   on delete cascade;
