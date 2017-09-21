CREATE TABLE merge_map
(
  hash text,
  document_id uuid,
  CONSTRAINT merge_map_pkey PRIMARY KEY (hash, document_id)
);