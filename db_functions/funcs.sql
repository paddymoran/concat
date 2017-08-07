CREATE OR REPLACE FUNCTION document_hash()
RETURNS trigger AS $$
BEGIN
    NEW.hash = encode(digest(data, 'sha256'), 'hex') FROM document_data WHERE document_data_id = NEW.document_data_id;
    RETURN NEW;
END $$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS  document_hash_trigger on documents;
CREATE TRIGGER document_hash_trigger
    BEFORE INSERT ON documents
    FOR EACH ROW
    EXECUTE PROCEDURE document_hash();


CREATE OR REPLACE FUNCTION document_set_json(uuid)
RETURNS JSON as
$$
WITH RECURSIVE docs(document_id, prev_id, original_id, document_set_id, generation) as (
    SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
    FROM documents t
    UNION
   SELECT result_document_id, input_document_id,original_id, document_set_id, generation + 1
    FROM sign_results tt, docs t
    WHERE t.document_id = tt.input_document_id
)
    SELECT row_to_json(qqq) FROM (
        SELECT
            $1 as document_set_id,
            array_to_json(array_agg(row_to_json(qq))) as documents
    FROM (
    SELECT d.document_id, filename, created_at, versions
    FROM (
    SELECT
    DISTINCT last_value(document_id) over wnd AS document_id, array_agg(document_id) OVER wnd as versions
    FROM docs
    WHERE document_set_id = $1
    WINDOW wnd AS (
       PARTITION BY original_id ORDER BY generation ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    )
    ) q
    JOIN documents d on d.document_id = q.document_id
    ) qq
 ) qqq

$$ LANGUAGE sql;