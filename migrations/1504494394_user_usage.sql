CREATE TABLE user_usage_limits
(
  user_id integer,
  amount_per_unit integer,
  unit string,
  CONSTRAINT user_usage_limits_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
)