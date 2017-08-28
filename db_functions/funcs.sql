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
             ds.name as name, ds.created_at as created_at,
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
        JOIN document_sets ds ON ds.document_set_id = $1
        GROUP BY ds.name, ds.created_at
 ) qqq

$$ LANGUAGE sql;




CREATE OR REPLACE FUNCTION delete_document(
    user_id integer,
    document_id uuid)
  RETURNS void AS
$BODY$
DELETE FROM document_data dd
USING documents d
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
WHERE d.document_data_id = dd.document_data_id and user_id = $1 AND document_id = $2 ;

$BODY$
  LANGUAGE sql VOLATILE;



CREATE OR REPLACE FUNCTION signature_requests(user_id integer)
RETURNS JSON as
$$
SELECT json_agg(row_to_json(q)) as "signature_requests"
FROM (
SELECT json_agg(
    json_build_object(
    'document_id', sr.document_id,
    'filename', d.filename,
    'sign_request_id', sr.sign_request_id,
    'prompts', sr.field_data,
    'created_at', d.created_at,
    'sign_status', CASE WHEN srr.sign_result_id IS NOT NULL THEN 'Signed' ELSE 'Pending' END
    )) as documents,
    d.document_set_id, ds.name, ds.created_at, u.name as "requester", u.user_id
FROM sign_requests sr
JOIN documents d ON d.document_id = sr.document_id
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
JOIN users u ON u.user_id = ds.user_id
LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
WHERE sr.user_id = $1

GROUP BY d.document_set_id, ds.name, ds.created_at, u.name, u.user_id
) q
$$ LANGUAGE sql;
