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


CREATE OR REPLACE FUNCTION document_status(uuid)
    RETURNS text as
    $$
    SELECT CASE WHEN (every(sr.sign_request_id is null) and every(srrr.sign_result_id is not null)) OR every(srr.sign_request_id is not null) THEN 'Signed' ELSE 'Pending' END as status
    FROM documents d
    LEFT OUTER JOIN sign_requests sr on d.document_id = sr.document_id
    LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
    LEFT OUTER JOIN sign_results srrr on srrr.input_document_id  = d.document_id
    WHERE d.document_id = $1
$$ LANGUAGE sql;


CREATE OR REPLACE FUNCTION latest_document_id(uuid)
RETURNS uuid as
$$
    WITH RECURSIVE docs(document_id, prev_id, original_id, generation) as (
        SELECT t.document_id, null::uuid, t.document_id, 0
        FROM documents t
        WHERE document_id = $1
        UNION
       SELECT result_document_id, input_document_id,original_id, generation + 1
        FROM sign_results tt, docs t
        WHERE t.document_id = tt.input_document_id AND tt.result_document_id IS NOT NULL
    )
    SELECT
    DISTINCT last_value(document_id) over wnd AS document_id
    FROM docs d

    WINDOW wnd AS (
       PARTITION BY original_id ORDER BY generation ASC
       ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    )
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION document_set_json(user_id integer, uuid)
RETURNS JSON as
$$
WITH RECURSIVE docs(document_id, prev_id, original_id, document_set_id, generation) as (
    SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
    FROM documents t
    UNION
   SELECT result_document_id, input_document_id,original_id, document_set_id, generation + 1
    FROM sign_results tt, docs t
    WHERE t.document_id = tt.input_document_id AND tt.result_document_id IS NOT NULL
)
    SELECT row_to_json(qqq) FROM (
        SELECT
            $1 as document_set_id,
             ds.name as name, ds.created_at as created_at,
            array_to_json(array_agg(row_to_json(qq))) as documents,
            CASE WHEN EVERY(sign_status = 'Signed') THEN 'Complete' ELSE 'Pending' END as status
        FROM (
            SELECT d.document_id, filename, created_at, versions, dv.field_data, document_status(start_id) as sign_status
            FROM (
                SELECT
                DISTINCT last_value(document_id) over wnd AS document_id, array_agg(document_id) OVER wnd as versions, first_value(document_id) over wnd as start_id
                FROM docs d
                WHERE document_set_id = $2

                WINDOW wnd AS (
                   PARTITION BY original_id ORDER BY generation ASC
                   ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )
            ) q
            JOIN documents d on d.document_id = q.document_id
            LEFT OUTER JOIN document_view dv ON (d.document_id = dv.document_id and user_id = $1)
        ) qq
        JOIN document_sets ds ON ds.document_set_id = $2
        GROUP BY ds.name, ds.created_at
        ORDER BY ds.created_at DESC
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
    'original_document_id', sr.document_id,
    'document_id', latest_document_id(sr.document_id),
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
ORDER BY ds.created_at DESC
) q
$$ LANGUAGE sql;



CREATE OR REPLACE FUNCTION document_set_status(uuid)
RETURNS text as
$$
SELECT CASE WHEN EVERY(document_status(document_id) = 'Signed') THEN 'Complete' ELSE 'Pending' END as status
FROM documents d
WHERE document_set_id = $1
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION usage(user_id integer, default_amount_per_unit integer, default_unit text)
RETURNS TABLE(signed_this_unit integer, requested_this_unit integer, amount_per_unit integer, unit text, max_allowance_reached boolean)
AS $$

    WITH
    usage_allowance as (
        SELECT
        CASE WHEN subscribed IS TRUE THEN NULL ELSE COALESCE(amount_per_unit, $2) END as amount_per_unit,
        COALESCE(unit, $3) as unit
        FROM public.users u
        LEFT OUTER JOIN user_usage_limits uul ON uul.user_id = u.user_id
        WHERE u.user_id = 9
        LIMIT 1
    ),
    requested_doc_ids as (
        SELECT DISTINCT d.document_id
        FROM sign_requests sr
        JOIN documents d on d.document_id = sr.document_id
        JOIN document_sets ds on d.document_set_id = ds.document_set_id
        WHERE
        ds.user_id = $1
        AND d.created_at > (now() - ( '1 ' || (SELECT unit FROM usage_allowance) )::INTERVAL)
    ),
    total_signed as (
        SELECT
        count(*)::integer as "signed_this_unit"
        FROM sign_results sr
        JOIN documents d ON d.document_id = sr.result_document_id
        LEFT OUTER JOIN requested_doc_ids rdi on rdi.document_id = sr.result_document_id
        WHERE
        sign_request_id IS NULL
        AND user_id = $1
        AND created_at > (now() - ( '1 ' || (SELECT unit FROM usage_allowance) )::INTERVAL)
        AND rdi.document_id IS NULL

    ),
    total_requested as (
    SELECT count(document_id)::integer as "requested_this_unit"
    FROM requested_doc_ids
    )
    SELECT signed_this_unit, requested_this_unit, amount_per_unit, unit, (signed_this_unit + requested_this_unit) > amount_per_unit as max_allowance_reached
    FROM (
    SELECT
        (SELECT signed_this_unit FROM total_signed),
        (SELECT requested_this_unit FROM total_requested),
        (SELECT  amount_per_unit FROM usage_allowance),
        (SELECT unit FROM usage_allowance)

        ) q
$$ LANGUAGE sql;

