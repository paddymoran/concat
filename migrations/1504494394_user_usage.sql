CREATE TABLE user_usage_limits
(
  user_id integer,
  amount_per_unit integer,
  unit text,
  CONSTRAINT user_usage_limits_user_id_fk FOREIGN KEY (user_id)
      REFERENCES public.users (user_id) MATCH SIMPLE
      ON UPDATE NO ACTION ON DELETE NO ACTION
);


ALTER TABLE public.users ADD COLUMN subscribed BOOLEAN DEFAULT FALSE;