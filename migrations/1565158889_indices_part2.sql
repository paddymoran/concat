
CREATE INDEX documents_document_set_id_idx ON documents(document_set_id);
CREATE INDEX document_sets_user_id_idx ON document_sets(user_id);
CREATE INDEX sign_results_input_document_id_idx ON sign_results(input_document_id);
CREATE INDEX sign_results_result_document_id_idx ON sign_results(result_document_id);

CREATE INDEX document_view_user_id_idx ON document_view(user_id);