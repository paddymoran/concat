

alter table sign_results
drop constraint sign_results_result_document_id_fk,
add CONSTRAINT sign_results_result_document_id_fk FOREIGN KEY (result_document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
   on delete cascade;


