CREATE OR REPLACE FUNCTION document_hash()
RETURNS trigger AS $$
BEGIN
    NEW.hash = encode(digest(data, 'sha256'), 'hex') FROM document_data WHERE document_data_id = NEW.document_data_id;
    RETURN NEW;
END $$ LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION request_info (uuid)
RETURNS JSON as
$$
SELECT json_agg(row_to_json(q)) FROM (
    SELECT
    u.user_id as user_id, name, email, srr.created_at, sr.sign_request_id,
    CASE
        WHEN srr.accepted THEN 'Signed'
        WHEN NOT srr.accepted THEN 'Rejected'
        ELSE 'Pending'
    END as status,
    CASE WHEN NOT srr.accepted THEN srr.field_data ELSE NULL END as rejection_explaination
    FROM documents d
    LEFT OUTER JOIN sign_requests sr on d.document_id = sr.document_id
    LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
    JOIN public.users u on sr.user_id = u.user_id
    WHERE d.document_id = $1
) q
$$ LANGUAGE sql;


DROP TRIGGER IF EXISTS  document_hash_trigger on documents;
CREATE TRIGGER document_hash_trigger
    BEFORE INSERT ON documents
    FOR EACH ROW
    EXECUTE PROCEDURE document_hash();


CREATE OR REPLACE FUNCTION document_status(uuid)
    RETURNS text as
    $$
    SELECT CASE
        WHEN (every(sr.sign_request_id is null) and every(srrr.sign_result_id is not null)) THEN 'Signed' -- self signed
        WHEN bool_or(NOT srr.accepted) THEN 'Rejected'
        WHEN every(srr.sign_request_id is not null) THEN 'Signed'
        ELSE 'Pending' END as status
    FROM documents d
    LEFT OUTER JOIN sign_requests sr on d.document_id = sr.document_id
    LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
    LEFT OUTER JOIN sign_results srrr on srrr.input_document_id  = d.document_id
    WHERE d.document_id = $1
$$ LANGUAGE sql;


CREATE OR REPLACE FUNCTION original_document_id(uuid)
RETURNS uuid as
$$
WITH RECURSIVE back_docs(document_id, prev_id, original_id, document_set_id, generation) as (
    SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
    FROM documents t
    WHERE t.document_id = $1
    UNION
   SELECT input_document_id, result_document_id, original_id, document_set_id, generation + 1
    FROM sign_results tt, back_docs t
    WHERE t.document_id = tt.result_document_id
)
SELECT document_id FROM back_docs order by generation DESC limit 1
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


CREATE OR REPLACE FUNCTION subsequent_document_ids(uuid)
RETURNS setof uuid as
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
    DISTINCT document_id
    FROM docs d
$$ LANGUAGE sql;


CREATE OR REPLACE FUNCTION signed_by(hash text)
RETURNS JSON as
$$
    WITH RECURSIVE back_docs(document_id, prev_id, original_id, document_set_id, generation) as (
        SELECT t.document_id, null::uuid, t.document_id,  document_set_id, 0
        FROM documents t
        UNION
       SELECT input_document_id, result_document_id, original_id, document_set_id, generation + 1
        FROM sign_results tt, back_docs t
        WHERE t.document_id = tt.result_document_id
    )
    SELECT json_agg(row_to_json(q)) FROM (
        SELECT u.name, u.email, u.user_id
        FROM
        documents d
        JOIN back_docs bd ON d.document_id = bd.original_id
        JOIN sign_results sr ON sr.result_document_id = bd.document_id
        JOIN users u ON sr.user_id = u.user_id
        WHERE
        hash = $1
        AND accepted = TRUE
        ORDER BY generation DESC
    ) q
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
            $2 as document_set_id,
             ds.name as name, ds.created_at as created_at,
            array_to_json(array_agg(row_to_json(qq))) as documents,
            CASE WHEN EVERY(sign_status != 'Pending') THEN 'Complete' ELSE 'Pending' END as status,
            ds.user_id = $1 as is_owner
        FROM (
            SELECT d.document_id, filename, created_at, versions, dv.field_data, document_status(start_id) as sign_status,
                request_info(start_id) as request_info
            FROM (
                SELECT
                DISTINCT last_value(d.document_id) over wnd AS document_id, array_agg(d.document_id) OVER wnd as versions, first_value(d.document_id) over wnd as start_id
                FROM docs d
                JOIN documents dd on d.document_id = d.document_id
                WHERE d.document_set_id = $2 and dd.deleted_at IS NULL

                WINDOW wnd AS (
                   PARTITION BY original_id ORDER BY generation ASC
                   ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )
            ) q
            JOIN documents d on d.document_id = q.document_id
            LEFT OUTER JOIN document_view dv ON (d.document_id = dv.document_id and user_id = $1)
        ) qq
        JOIN document_sets ds ON ds.document_set_id = $2
        GROUP BY ds.name, ds.created_at, ds.user_id

        ORDER BY ds.created_at DESC
 ) qqq
$$ LANGUAGE sql;

CREATE OR REPLACE FUNCTION revoke_signature_request(
    user_id integer,
    sign_request_id integer)
  RETURNS void AS
$BODY$
DELETE FROM sign_requests sr
USING documents d
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
WHERE d.document_id = sr.document_id and ds.user_id = $1 AND sr.sign_request_id = $2 ;
$BODY$
  LANGUAGE sql VOLATILE;



CREATE OR REPLACE FUNCTION delete_document(
    user_id integer,
    document_id uuid)
  RETURNS uuid AS
$$
DECLARE
    start_id uuid;
    result_document_set_id uuid;
    user_id integer;
    loop_id uuid;
    data_id uuid;
BEGIN
    start_id := (SELECT original_document_id($2));
    result_document_set_id := (SELECT d.document_set_id FROM documents d WHERE d.document_id = start_id);
    user_id := (SELECT ds.user_id FROM document_sets ds WHERE ds.document_set_id = result_document_set_id);
    IF user_id != $1 THEN RETURN NULL; END IF;
    FOR loop_id IN (SELECT subsequent_document_ids(start_id)) LOOP
        data_id := (SELECT document_data_id  FROM documents dd WHERE dd.document_id = loop_id);
        UPDATE documents dd SET deleted_at = now(), document_data_id = NULL WHERE dd.document_id = loop_id;
        DELETE FROM document_data dd WHERE dd.document_data_id = data_id;
    END LOOP;
    PERFORM delete_document_set_if_empty($1, result_document_set_id);
    RETURN result_document_set_id;
END
$$
  LANGUAGE plpgsql VOLATILE;




CREATE OR REPLACE FUNCTION delete_document_set_if_empty(
    user_id integer,
    document_set_id uuid)
  RETURNS void AS
    $BODY$
    UPDATE document_sets ds SET deleted_at = now()
    WHERE user_id = $1 AND ds.document_set_id = $2 AND NOT EXISTS(SELECT * FROM documents WHERE document_set_id = $2 AND deleted_at IS NULL)
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
    'sign_status', CASE WHEN srr.sign_result_id IS NOT NULL
        THEN CASE WHEN srr.accepted = True THEN 'Signed' ELSE 'Rejected' END

        ELSE 'Pending' END
    )) as documents,
    d.document_set_id, ds.name, ds.created_at, u.name as "requester", u.user_id,  ds.user_id = $1 as is_owner
FROM sign_requests sr
JOIN documents d ON d.document_id = sr.document_id
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
JOIN users u ON u.user_id = ds.user_id
LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
WHERE sr.user_id = $1 AND d.deleted_at IS NULL and ds.deleted_at IS NULL

GROUP BY d.document_set_id, ds.name, ds.created_at, u.name, u.user_id, ds.user_id
ORDER BY ds.created_at DESC
) q
$$ LANGUAGE sql;



CREATE OR REPLACE FUNCTION document_set_status(uuid)
RETURNS text as
$$
SELECT CASE WHEN EVERY(document_status(document_id) != 'Pending') THEN 'Complete' ELSE 'Pending' END as status
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
        WHERE u.user_id = $1
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
        AND d.created_at > (now() - ( '1 ' || (SELECT unit FROM usage_allowance) )::INTERVAL)
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

