alter table sign_requests
drop constraint sign_requests_document_id_fk,
add CONSTRAINT sign_requests_document_id_fk FOREIGN KEY (document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
   on delete cascade;



alter table sign_results
drop constraint sign_results_input_document_id_fk,
add CONSTRAINT sign_results_input_document_id_fk FOREIGN KEY (input_document_id)
      REFERENCES public.documents (document_id) MATCH SIMPLE
   on delete cascade;



