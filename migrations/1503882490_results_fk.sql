alter table sign_results add column sign_request_id integer;
alter table sign_results add CONSTRAINT sign_results_sign_request_id_fk FOREIGN KEY (sign_request_id)
     REFERENCES public.sign_requests (sign_request_id) MATCH SIMPLE
   on delete cascade;