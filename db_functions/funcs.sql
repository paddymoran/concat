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