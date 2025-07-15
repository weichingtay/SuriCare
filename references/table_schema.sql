-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

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
  CONSTRAINT chatbot_chats_pkey PRIMARY KEY (id),
  CONSTRAINT chatbot_chats_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.primary_care_giver(id)
);
CREATE TABLE public.child (
  id integer NOT NULL DEFAULT nextval('child_id_seq'::regclass),
  name character varying NOT NULL,
  birth_date timestamp with time zone NOT NULL,
  gender character varying NOT NULL,
  carer_id integer NOT NULL,
  CONSTRAINT child_pkey PRIMARY KEY (id),
  CONSTRAINT child_carer_id_fkey FOREIGN KEY (carer_id) REFERENCES public.primary_care_giver(id)
);
CREATE TABLE public.growth (
  id integer NOT NULL DEFAULT nextval('growth_id_seq'::regclass),
  check_in timestamp with time zone NOT NULL,
  weight double precision NOT NULL,
  height double precision NOT NULL,
  head_circumference double precision NOT NULL,
  note character varying,
  child_id integer NOT NULL,
  CONSTRAINT growth_pkey PRIMARY KEY (id),
  CONSTRAINT growth_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id)
);
CREATE TABLE public.growth_benchmark (
  id integer NOT NULL DEFAULT nextval('growth_benchmark_id_seq'::regclass),
  age_month integer NOT NULL,
  weight double precision NOT NULL,
  height double precision NOT NULL,
  head_circumference double precision NOT NULL,
  gender character varying NOT NULL,
  CONSTRAINT growth_benchmark_pkey PRIMARY KEY (id)
);
CREATE TABLE public.meal (
  id integer NOT NULL DEFAULT nextval('meal_id_seq'::regclass),
  check_in timestamp with time zone NOT NULL,
  consumption_level double precision NOT NULL,
  others character varying,
  note character varying,
  meal_time_category integer NOT NULL,
  meal_category integer NOT NULL,
  child_id integer NOT NULL,
  CONSTRAINT meal_pkey PRIMARY KEY (id),
  CONSTRAINT meal_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id),
  CONSTRAINT meal_meal_category_fkey FOREIGN KEY (meal_category) REFERENCES public.meal_category(id),
  CONSTRAINT meal_meal_time_category_fkey FOREIGN KEY (meal_time_category) REFERENCES public.meal_time_category(id)
);
CREATE TABLE public.meal_category (
  id integer NOT NULL DEFAULT nextval('meal_category_id_seq'::regclass),
  category character varying NOT NULL,
  CONSTRAINT meal_category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.meal_time_category (
  id integer NOT NULL DEFAULT nextval('meal_time_category_id_seq'::regclass),
  time_category character varying NOT NULL,
  CONSTRAINT meal_time_category_pkey PRIMARY KEY (id)
);
CREATE TABLE public.poop (
  id integer NOT NULL DEFAULT nextval('poop_id_seq'::regclass),
  check_in timestamp with time zone NOT NULL,
  note character varying NOT NULL,
  color integer NOT NULL,
  consistency integer NOT NULL,
  child_id integer NOT NULL,
  CONSTRAINT poop_pkey PRIMARY KEY (id),
  CONSTRAINT poop_color_fkey FOREIGN KEY (color) REFERENCES public.poop_color(id),
  CONSTRAINT poop_consistency_fkey FOREIGN KEY (consistency) REFERENCES public.poop_consistency(id),
  CONSTRAINT poop_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id)
);
CREATE TABLE public.poop_color (
  id integer NOT NULL DEFAULT nextval('poop_color_id_seq'::regclass),
  category character varying NOT NULL,
  CONSTRAINT poop_color_pkey PRIMARY KEY (id)
);
CREATE TABLE public.poop_consistency (
  id integer NOT NULL DEFAULT nextval('poop_consistency_id_seq'::regclass),
  category character varying NOT NULL,
  CONSTRAINT poop_consistency_pkey PRIMARY KEY (id)
);
CREATE TABLE public.primary_care_giver (
  id integer NOT NULL DEFAULT nextval('primary_care_giver_id_seq'::regclass),
  username character varying NOT NULL,
  email character varying NOT NULL,
  contact_number character varying NOT NULL,
  password character varying NOT NULL,
  relationship character varying NOT NULL,
  auth_user_id uuid UNIQUE,
  CONSTRAINT primary_care_giver_pkey PRIMARY KEY (id),
  CONSTRAINT primary_care_giver_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.sleep_time (
  id integer NOT NULL DEFAULT nextval('sleep_time_id_seq'::regclass),
  check_in timestamp with time zone NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  note character varying,
  child_id integer NOT NULL,
  CONSTRAINT sleep_time_pkey PRIMARY KEY (id),
  CONSTRAINT sleep_time_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id)
);
CREATE TABLE public.symptom (
  id integer NOT NULL DEFAULT nextval('symptom_id_seq'::regclass),
  check_in timestamp with time zone NOT NULL,
  symptom character varying NOT NULL,
  photo_url character varying NOT NULL,
  note character varying,
  child_id integer NOT NULL,
  CONSTRAINT symptom_pkey PRIMARY KEY (id),
  CONSTRAINT symptom_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.child(id)
);
