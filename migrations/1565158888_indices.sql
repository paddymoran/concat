
CREATE INDEX sign_result_sign_request_id_idx ON sign_results(sign_request_id);
CREATE INDEX sign_request_user_id_idx ON sign_requests(user_id);
CREATE INDEX sign_result_user_id_idx ON sign_results(user_id);


CREATE INDEX documents_deleted_idx ON documents(deleted_at);
CREATE INDEX document_sets_deleted_idx ON document_sets(deleted_at);
CREATE INDEX document_sets_created_idx ON document_sets(created_at);
CREATE INDEX sign_results_created_idx ON sign_results(created_at);