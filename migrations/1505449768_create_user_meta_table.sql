CREATE TABLE user_meta (
  user_id INTEGER PRIMARY KEY,
  data JSONB,

  CONSTRAINT user_meta_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)
