CREATE OR REPLACE FUNCTION document_hash()
RETURNS trigger AS $$
BEGIN
    NEW.hash = encode(digest(data, 'sha256'), 'hex') FROM document_data WHERE document_data_id = NEW.document_data_id;
    NEW.length = octet_length(data) FROM document_data WHERE document_data_id = NEW.document_data_id;
    RETURN NEW;
END $$ LANGUAGE 'plpgsql';


CREATE OR REPLACE FUNCTION format_iso_date(d timestamp with time zone)
    RETURNS text
    AS $$
    SELECT to_char($1 at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION request_info (uuid)
RETURNS JSON as
$$
SELECT json_agg(row_to_json(q)) FROM (
    SELECT
    u.user_id as user_id, name, email, format_iso_date(srr.created_at), sr.sign_request_id,
    CASE
        WHEN srr.accepted THEN 'Signed'
        WHEN NOT srr.accepted THEN 'Rejected'
        ELSE 'Pending'
    END as status,
    CASE WHEN NOT srr.accepted THEN srr.field_data ELSE NULL END as rejection_explaination,
    CASE WHEN srr.accepted THEN srr.field_data->>'acceptedMessage' ELSE NULL END AS accepted_message
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
        WHEN (every(sr.sign_request_id is null) and every(srrr.sign_result_id is not null)) THEN 'Complete' -- self signed
        WHEN every(srr.sign_request_id is not null) THEN 'Complete'
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
        SELECT filename, d.document_id, json_agg(
        json_build_object('name', u.name, 'email', u.email, 'user_id', u.user_id)) as signees
        FROM
        documents d
        LEFT OUTER JOIN merge_map mm on d.document_id = mm.document_id
        JOIN back_docs bd ON d.document_id = bd.original_id
        JOIN sign_results sr ON sr.result_document_id = bd.document_id
        JOIN users u ON sr.user_id = u.user_id
        WHERE
        (d.hash = $1 or mm.hash = $1)
        AND accepted = TRUE
        GROUP BY filename, d.document_id
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
             ds.name as name, format_iso_date(ds.created_at) as created_at,
            array_to_json(array_agg(row_to_json(qq))) as documents,
            CASE WHEN EVERY(sign_status != 'Pending') THEN 'Complete' ELSE 'Pending' END as status,
            sum(size) as size,
            ds.user_id = $1 as is_owner
        FROM (
            SELECT d.document_id, filename, format_iso_date(created_at), versions, dv.field_data, document_status(start_id) as sign_status,
                d.length as size,
                    q.source as source,
                request_info(start_id) as request_info
            FROM (
                SELECT
                DISTINCT last_value(d.document_id) over wnd AS document_id,
                array_agg(d.document_id) OVER wnd as versions,
                first_value(d.document_id) over wnd as start_id,
                first_value(dd.order_index) OVER wnd as order_index,
                first_value(dd.source) OVER wnd as source
                FROM docs d
                JOIN documents dd on d.document_id = dd.document_id
                WHERE d.document_set_id = $2 and dd.deleted_at IS NULL

                WINDOW wnd AS (
                   PARTITION BY original_id ORDER BY generation ASC
                   ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                )

            ) q
            JOIN documents d on d.document_id = q.document_id
            LEFT OUTER JOIN document_view dv ON (d.document_id = dv.document_id and user_id = $1)
            ORDER BY q.order_index ASC

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
WITH latest_results AS (
    SELECT * 
    FROM sign_results sr 
    JOIN (
        SELECT distinct (sign_request_id) sign_request_id, sign_result_id, created_at
        FROM sign_results
        WHERE sign_request_id is NOT NULL
        ORDER BY sign_result_id, created_at desc
    ) q on sr.sign_result_id = q.sign_result_id
)
SELECT json_agg(row_to_json(q)) as "signature_requests"
FROM (
SELECT json_agg(
    json_build_object(
    'original_document_id', sr.document_id,
    'document_id', latest_document_id(sr.document_id),
    'filename', d.filename,
    'sign_request_id', sr.sign_request_id,
    'prompts', CASE WHEN srr.sign_result_id IS NULL THEN sr.field_data ELSE NULL END,
    'created_at', format_iso_date(d.created_at),
    'size',  d.length,
    'sign_status', document_status(sr.document_id),
    'rejection_explaination', CASE WHEN NOT srr.accepted THEN srr.field_data ELSE NULL END ,
    'accepted_message', CASE WHEN srr.accepted THEN srr.field_data->>'acceptedMessage' ELSE NULL END,
    'request_status', CASE WHEN srr.sign_result_id IS NOT NULL
        THEN CASE WHEN srr.accepted = True THEN 'Signed' ELSE 'Rejected' END
        ELSE 'Pending' END
    ) ORDER BY d.order_index ASC) as documents,
    d.document_set_id, ds.name, format_iso_date(ds.created_at) as created_at, u.name as "requester", u.user_id,  ds.user_id = $1 as is_owner
FROM sign_requests  sr
JOIN documents d ON d.document_id = sr.document_id
JOIN document_sets ds ON ds.document_set_id = d.document_set_id
JOIN users u ON u.user_id = ds.user_id
LEFT OUTER JOIN sign_results srr on srr.sign_request_id = sr.sign_request_id
WHERE sr.user_id = $1 AND d.deleted_at IS NULL and ds.deleted_at IS NULL
AND ds.created_at > now() - interval '1 year'
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
    requested_doc_set_ids as (
        SELECT DISTINCT d.document_set_id
        FROM sign_requests sr
        JOIN documents d on d.document_id = sr.document_id
        JOIN document_sets ds on d.document_set_id = ds.document_set_id
        WHERE
        ds.user_id = $1
        AND d.created_at > (now() - ( '1 ' || (SELECT unit FROM usage_allowance) )::INTERVAL)
        AND d.source = 'uploaded'
    ),
    total_signed as (
        SELECT
        count(DISTINCT d.document_set_id)::integer as "signed_this_unit"
        FROM sign_results sr
        JOIN documents d ON d.document_id = sr.input_document_id
        WHERE
        sr.sign_request_id IS NULL
        AND user_id = $1
        AND d.created_at > (now() - ( '1 ' || (SELECT unit FROM usage_allowance) )::INTERVAL)
        AND d.source = 'uploaded'

    ),
    total_requested as (
        SELECT count(document_set_id)::integer as "requested_this_unit"
        FROM requested_doc_set_ids
    )
    SELECT signed_this_unit, requested_this_unit, amount_per_unit, unit, (signed_this_unit + requested_this_unit) >= amount_per_unit as max_allowance_reached
    FROM (
    SELECT
        (SELECT signed_this_unit FROM total_signed),
        (SELECT requested_this_unit FROM total_requested),
        (SELECT  amount_per_unit FROM usage_allowance),
        (SELECT unit FROM usage_allowance)
        ) q
$$ LANGUAGE sql;


CREATE OR REPLACE FUNCTION add_merged_file(
    data bytea,
    document_ids uuid[])
  RETURNS void AS
$$
DECLARE
    data_hash text;
    document_id uuid;
BEGIN

    data_hash := encode(digest(data, 'sha256'), 'hex');
    DELETE FROM merge_map WHERE hash = data_hash;
     FOREACH document_id IN ARRAY document_ids
    LOOP
       INSERT INTO merge_map (hash, document_id) VALUES (data_hash, document_id);
    END LOOP;
END
$$
  LANGUAGE plpgsql VOLATILE;

