-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.access_levels (
  value character varying NOT NULL UNIQUE,
  label character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('access_levels_id_seq'::regclass),
  CONSTRAINT access_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.accounts (
  name character varying NOT NULL UNIQUE,
  id integer NOT NULL DEFAULT nextval('accounts_id_seq'::regclass),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT accounts_pkey PRIMARY KEY (id)
);
CREATE TABLE public.chat_messages (
  id uuid NOT NULL,
  chat_id uuid NOT NULL,
  message text,
  sender character varying NOT NULL,
  created_at timestamp with time zone NOT NULL,
  CONSTRAINT chat_messages_pkey PRIMARY KEY (id),
  CONSTRAINT chat_messages_chat_id_fkey FOREIGN KEY (chat_id) REFERENCES public.chatbot_chats(id)
);
CREATE TABLE public.chatbot_chats (
  id uuid NOT NULL,
  title character varying,
  owner_id integer NOT NULL,
  created_at timestamp with time zone NOT NULL,
  updated_at timestamp with time zone NOT NULL,
  child_id integer,
  CONSTRAINT chatbot_chats_pkey PRIMARY KEY (id),
  CONSTRAINT chatbot_chats_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id),
  CONSTRAINT chatbot_chats_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.primary_care_giver(id)
);
CREATE TABLE public.child (
  name character varying NOT NULL,
  birth_date timestamp with time zone NOT NULL,
  gender character varying NOT NULL,
  carer_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('child_id_seq'::regclass),
  CONSTRAINT child_pkey PRIMARY KEY (id),
  CONSTRAINT child_carer_id_fkey FOREIGN KEY (carer_id) REFERENCES public.primary_care_giver(id)
);
CREATE TABLE public.consumption_levels (
  value character varying NOT NULL UNIQUE,
  label character varying NOT NULL,
  percentage integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('consumption_levels_id_seq'::regclass),
  CONSTRAINT consumption_levels_pkey PRIMARY KEY (id)
);
CREATE TABLE public.gender_options (
  value character varying NOT NULL UNIQUE,
  label character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('gender_options_id_seq'::regclass),
  CONSTRAINT gender_options_pkey PRIMARY KEY (id)
);
CREATE TABLE public.growth (
  account_id integer,
  check_in timestamp with time zone NOT NULL,
  weight double precision NOT NULL,
  height double precision NOT NULL,
  head_circumference double precision NOT NULL,
  note character varying,
  child_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('growth_id_seq'::regclass),
  CONSTRAINT growth_pkey PRIMARY KEY (id),
  CONSTRAINT fk_growth_account_id FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT growth_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id)
);
CREATE TABLE public.growth_benchmark (
  age_month integer NOT NULL,
  weight double precision NOT NULL,
  height double precision NOT NULL,
  head_circumference double precision NOT NULL,
  gender character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('growth_benchmark_id_seq'::regclass),
  CONSTRAINT growth_benchmark_pkey PRIMARY KEY (id)
);
CREATE TABLE public.health_alerts (
  id uuid NOT NULL,
  child_id integer NOT NULL,
  alert_type character varying NOT NULL,
  title character varying NOT NULL,
  description text,
  severity character varying NOT NULL,
  suggestions json,
  analysis_date timestamp without time zone NOT NULL,
  data_period_start timestamp without time zone NOT NULL,
  data_period_end timestamp without time zone NOT NULL,
  created_at timestamp with time zone NOT NULL,
  is_read boolean NOT NULL,
  read_at timestamp with time zone,
  is_deleted boolean NOT NULL,
  deleted_at timestamp with time zone,
  CONSTRAINT health_alerts_pkey PRIMARY KEY (id),
  CONSTRAINT health_alerts_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id)
);
CREATE TABLE public.meal (
  account_id integer,
  check_in timestamp with time zone NOT NULL,
  consumption_level double precision NOT NULL,
  note character varying,
  meal_time_category integer NOT NULL,
  meal_category integer NOT NULL,
  child_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('meal_id_seq'::regclass),
  others character varying,
  CONSTRAINT meal_pkey PRIMARY KEY (id),
  CONSTRAINT meal_meal_category_fkey FOREIGN KEY (meal_category) REFERENCES public.meal_category(id),
  CONSTRAINT fk_meal_account_id FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT meal_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id),
  CONSTRAINT meal_meal_time_category_fkey FOREIGN KEY (meal_time_category) REFERENCES public.meal_time_category(id)
);
CREATE TABLE public.meal_category (
  category character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('meal_category_id_seq'::regclass),
  CONSTRAINT meal_category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.meal_time_category (
  time_category character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('meal_time_category_id_seq'::regclass),
  CONSTRAINT meal_time_category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.poop (
  account_id integer,
  texture integer NOT NULL,
  note character varying,
  check_in timestamp with time zone NOT NULL,
  color integer NOT NULL,
  child_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('poop_id_seq'::regclass),
  CONSTRAINT poop_pkey PRIMARY KEY (id),
  CONSTRAINT fk_poop_account_id FOREIGN KEY (account_id) REFERENCES public.accounts(id),
  CONSTRAINT poop_texture_fkey FOREIGN KEY (texture) REFERENCES public.poop_texture(id),
  CONSTRAINT poop_color_fkey FOREIGN KEY (color) REFERENCES public.poop_color(id),
  CONSTRAINT poop_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id)
);
CREATE TABLE public.poop_color (
  category character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('poop_color_id_seq'::regclass),
  CONSTRAINT poop_color_pkey PRIMARY KEY (id)
);
CREATE TABLE public.poop_texture (
  category character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('poop_consistency_id_seq'::regclass),
  CONSTRAINT poop_texture_pkey PRIMARY KEY (id)
);
CREATE TABLE public.primary_care_giver (
  username character varying NOT NULL,
  email character varying NOT NULL,
  contact_number character varying NOT NULL,
  password character varying NOT NULL,
  relationship character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('primary_care_giver_id_seq'::regclass),
  auth_user_id uuid UNIQUE,
  CONSTRAINT primary_care_giver_pkey PRIMARY KEY (id),
  CONSTRAINT primary_care_giver_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.relationship_types (
  value character varying NOT NULL UNIQUE,
  label character varying NOT NULL,
  id integer NOT NULL DEFAULT nextval('relationship_types_id_seq'::regclass),
  CONSTRAINT relationship_types_pkey PRIMARY KEY (id)
);
CREATE TABLE public.saved_articles (
  user_id integer NOT NULL,
  article_id character varying NOT NULL,
  article_data json,
  saved_at timestamp with time zone NOT NULL,
  child_id integer,
  id integer NOT NULL DEFAULT nextval('saved_articles_id_seq'::regclass),
  CONSTRAINT saved_articles_pkey PRIMARY KEY (id),
  CONSTRAINT saved_articles_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id),
  CONSTRAINT saved_articles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.primary_care_giver(id)
);
CREATE TABLE public.sleep_time (
  account_id integer,
  check_in timestamp with time zone NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  note character varying,
  child_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('sleep_time_id_seq'::regclass),
  CONSTRAINT sleep_time_pkey PRIMARY KEY (id),
  CONSTRAINT sleep_time_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id),
  CONSTRAINT fk_sleep_time_account_id FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);
CREATE TABLE public.symptom (
  account_id integer,
  check_in timestamp with time zone NOT NULL,
  symptom character varying NOT NULL,
  photo_url character varying NOT NULL,
  note character varying,
  child_id integer NOT NULL,
  id integer NOT NULL DEFAULT nextval('symptom_id_seq'::regclass),
  CONSTRAINT symptom_pkey PRIMARY KEY (id),
  CONSTRAINT symptom_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id),
  CONSTRAINT fk_symptom_account_id FOREIGN KEY (account_id) REFERENCES public.accounts(id)
);
CREATE TABLE public.symptom_types (
  value character varying NOT NULL UNIQUE,
  label character varying NOT NULL,
  icon character varying,
  id integer NOT NULL DEFAULT nextval('symptom_types_id_seq'::regclass),
  CONSTRAINT symptom_types_pkey PRIMARY KEY (id)
);
