-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Vehicle_Aero_Specs (
  car_id bigint NOT NULL,
  model_name character varying NOT NULL,
  wing_area double precision NOT NULL,
  curb_weight double precision NOT NULL,
  CONSTRAINT Vehicle_Aero_Specs_pkey PRIMARY KEY (car_id)
);
CREATE TABLE public.Track_Environments (
  env_id bigint NOT NULL,
  track_name character varying NOT NULL,
  air_density double precision NOT NULL,
  friction_coeff double precision NOT NULL,
  CONSTRAINT Track_Environments_pkey PRIMARY KEY (env_id)
);
CREATE TABLE public.Mechanical_Run_Logs (
  log_id bigint NOT NULL,
  car_id bigint NOT NULL,
  env_id bigint NOT NULL,
  wing_angle double precision NOT NULL,
  velocity double precision NOT NULL,
  tire_compound character varying NOT NULL,
  calculated_downforce double precision,
  calculated_wear_rate double precision,
  CONSTRAINT Mechanical_Run_Logs_pkey PRIMARY KEY (log_id)
);