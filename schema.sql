CREATE DATABASE IF NOT EXISTS aetire_db;
USE aetire_db;

CREATE TABLE Vehicle_Aero_Specs (
  car_id BIGINT NOT NULL AUTO_INCREMENT,
  model_name VARCHAR(255) NOT NULL,
  wing_area DOUBLE NOT NULL,
  curb_weight DOUBLE NOT NULL,
  PRIMARY KEY (car_id)
);

CREATE TABLE Track_Environments (
  env_id BIGINT NOT NULL AUTO_INCREMENT,
  track_name VARCHAR(255) NOT NULL,
  air_density DOUBLE NOT NULL,
  friction_coeff DOUBLE NOT NULL,
  PRIMARY KEY (env_id)
);

CREATE TABLE Mechanical_Run_Logs (
  log_id BIGINT NOT NULL AUTO_INCREMENT,
  car_id BIGINT NOT NULL,
  env_id BIGINT NOT NULL,
  wing_angle DOUBLE NOT NULL,
  velocity DOUBLE NOT NULL,
  tire_compound VARCHAR(255) NOT NULL,
  calculated_downforce DOUBLE,
  calculated_wear_rate DOUBLE,
  PRIMARY KEY (log_id),
  FOREIGN KEY (car_id) REFERENCES Vehicle_Aero_Specs(car_id),
  FOREIGN KEY (env_id) REFERENCES Track_Environments(env_id)
);