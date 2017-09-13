ALTER TABLE documents ADD COLUMN length integer;

UPDATE documents
AS d
SET length = octet_length(data)
FROM document_data AS dd
WHERE d.document_data_id = dd.document_data_id;