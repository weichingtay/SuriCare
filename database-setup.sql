-- SuriCare Database Lookup Tables Population
-- This script populates the lookup tables with initial data
-- Run this after creating the database schema

-- Populate meal_category table
INSERT INTO public.meal_category (category) VALUES 
('milk'),
('solid'), 
('mixed'),
('others')
ON CONFLICT (category) DO NOTHING;

-- Populate meal_time_category table
INSERT INTO public.meal_time_category (time_category) VALUES
('breakfast'),
('lunch'),
('dinner')
ON CONFLICT (time_category) DO NOTHING;

-- Populate poop_color table
INSERT INTO public.poop_color (category) VALUES
('yellow'),
('red'),
('brown'),
('green'),
('black'),
('gray')
ON CONFLICT (category) DO NOTHING;

-- Populate poop_consistency table
INSERT INTO public.poop_consistency (category) VALUES
('pellets'),
('lumpy'),
('cracked'),
('smooth'),
('soft'),
('mushy'),
('watery')
ON CONFLICT (category) DO NOTHING;

-- Create and populate additional lookup tables needed for the frontend

-- Gender options table
CREATE TABLE IF NOT EXISTS public.gender_options (
  id integer NOT NULL DEFAULT nextval('gender_options_id_seq'::regclass),
  value character varying NOT NULL,
  label character varying NOT NULL,
  CONSTRAINT gender_options_pkey PRIMARY KEY (id),
  CONSTRAINT gender_options_value_unique UNIQUE (value)
);

INSERT INTO public.gender_options (value, label) VALUES
('male', 'Male'),
('female', 'Female'),
('other', 'Other'),
('prefer_not_to_say', 'Prefer not to say')
ON CONFLICT (value) DO NOTHING;

-- Relationship types table
CREATE TABLE IF NOT EXISTS public.relationship_types (
  id integer NOT NULL DEFAULT nextval('relationship_types_id_seq'::regclass),
  value character varying NOT NULL,
  label character varying NOT NULL,
  CONSTRAINT relationship_types_pkey PRIMARY KEY (id),
  CONSTRAINT relationship_types_value_unique UNIQUE (value)
);

INSERT INTO public.relationship_types (value, label) VALUES
('mother', 'Mother'),
('father', 'Father'),
('grandfather', 'Grandfather'),
('grandmother', 'Grandmother'),
('nanny_babysitter', 'Nanny/Babysitter'),
('aunt', 'Aunt'),
('uncle', 'Uncle'),
('guardian', 'Guardian'),
('other', 'Other')
ON CONFLICT (value) DO NOTHING;

-- Symptom types table
CREATE TABLE IF NOT EXISTS public.symptom_types (
  id integer NOT NULL DEFAULT nextval('symptom_types_id_seq'::regclass),
  value character varying NOT NULL,
  label character varying NOT NULL,
  icon character varying,
  CONSTRAINT symptom_types_pkey PRIMARY KEY (id),
  CONSTRAINT symptom_types_value_unique UNIQUE (value)
);

INSERT INTO public.symptom_types (value, label, icon) VALUES
('cough', 'Cough', 'mdi-account-voice'),
('fever', 'Fever', 'mdi-thermometer'),
('cold', 'Cold', 'mdi-weather-snowy'),
('rash', 'Rash', 'mdi-circle-outline'),
('other', 'Other', 'mdi-dots-horizontal')
ON CONFLICT (value) DO NOTHING;

-- Access levels table (for sharing children)
CREATE TABLE IF NOT EXISTS public.access_levels (
  id integer NOT NULL DEFAULT nextval('access_levels_id_seq'::regclass),
  value character varying NOT NULL,
  label character varying NOT NULL,
  CONSTRAINT access_levels_pkey PRIMARY KEY (id),
  CONSTRAINT access_levels_value_unique UNIQUE (value)
);

INSERT INTO public.access_levels (value, label) VALUES
('full', 'Full Access'),
('partial', 'Partial Access')
ON CONFLICT (value) DO NOTHING;

-- Consumption levels table (for meals)
CREATE TABLE IF NOT EXISTS public.consumption_levels (
  id integer NOT NULL DEFAULT nextval('consumption_levels_id_seq'::regclass),
  value character varying NOT NULL,
  label character varying NOT NULL,
  percentage integer NOT NULL,
  CONSTRAINT consumption_levels_pkey PRIMARY KEY (id),
  CONSTRAINT consumption_levels_value_unique UNIQUE (value)
);

INSERT INTO public.consumption_levels (value, label, percentage) VALUES
('0', '0% (Refused)', 0),
('25', '25% (Partial)', 25),
('50', '50% (Partial)', 50),
('75', '75% (Partial)', 75),
('100', '100% (Full)', 100)
ON CONFLICT (value) DO NOTHING;

-- Create sequences for the new tables
CREATE SEQUENCE IF NOT EXISTS public.gender_options_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.relationship_types_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.symptom_types_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.access_levels_id_seq;
CREATE SEQUENCE IF NOT EXISTS public.consumption_levels_id_seq;

-- Set sequence ownership
ALTER SEQUENCE public.gender_options_id_seq OWNED BY public.gender_options.id;
ALTER SEQUENCE public.relationship_types_id_seq OWNED BY public.relationship_types.id;
ALTER SEQUENCE public.symptom_types_id_seq OWNED BY public.symptom_types.id;
ALTER SEQUENCE public.access_levels_id_seq OWNED BY public.access_levels.id;
ALTER SEQUENCE public.consumption_levels_id_seq OWNED BY public.consumption_levels.id;

-- Set default values for id columns
ALTER TABLE public.gender_options ALTER COLUMN id SET DEFAULT nextval('gender_options_id_seq');
ALTER TABLE public.relationship_types ALTER COLUMN id SET DEFAULT nextval('relationship_types_id_seq');
ALTER TABLE public.symptom_types ALTER COLUMN id SET DEFAULT nextval('symptom_types_id_seq');
ALTER TABLE public.access_levels ALTER COLUMN id SET DEFAULT nextval('access_levels_id_seq');
ALTER TABLE public.consumption_levels ALTER COLUMN id SET DEFAULT nextval('consumption_levels_id_seq');