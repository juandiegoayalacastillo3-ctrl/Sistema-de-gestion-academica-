CREATE DATABASE IF NOT EXISTS database_sistemaacademico
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE database_sistemaacademico;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  password_hash CHAR(64) NOT NULL,
  rol ENUM('docente', 'directivo', 'padre', 'estudiante') NOT NULL,
  iniciales VARCHAR(8) NOT NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS estudiantes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  curso ENUM('9A', '9B', '9C', '10A') NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  acudiente VARCHAR(120) NOT NULL,
  acudiente_email VARCHAR(160) NOT NULL,
  presente TINYINT(1) NOT NULL DEFAULT 1,
  justificado TINYINT(1) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS materias_periodos (
  materia ENUM('Matematicas', 'Espanol', 'Ciencias', 'Historia', 'Ingles') NOT NULL,
  periodo ENUM('1', '2', '3', '4') NOT NULL,
  PRIMARY KEY (materia, periodo)
);

CREATE TABLE IF NOT EXISTS notas (
  estudiante_id INT NOT NULL,
  materia ENUM('Matematicas', 'Espanol', 'Ciencias', 'Historia', 'Ingles') NOT NULL,
  periodo ENUM('1', '2', '3', '4') NOT NULL,
  nota1 DECIMAL(3,1) NOT NULL DEFAULT 0,
  nota2 DECIMAL(3,1) NOT NULL DEFAULT 0,
  nota3 DECIMAL(3,1) NOT NULL DEFAULT 0,
  ultima_modificacion BIGINT NOT NULL DEFAULT 0,
  PRIMARY KEY (estudiante_id, materia, periodo),
  CONSTRAINT fk_notas_estudiante
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id)
    ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comunicados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(160) NOT NULL,
  mensaje TEXT NOT NULL,
  destinatario VARCHAR(120) NOT NULL,
  fecha DATE NOT NULL,
  tipo ENUM('info', 'alerta', 'urgente') NOT NULL,
  autor VARCHAR(120) NOT NULL
);

INSERT IGNORE INTO materias_periodos (materia, periodo) VALUES
('Matematicas', '1'), ('Matematicas', '2'), ('Matematicas', '3'), ('Matematicas', '4'),
('Espanol', '1'), ('Espanol', '2'), ('Espanol', '3'), ('Espanol', '4'),
('Ciencias', '1'), ('Ciencias', '2'), ('Ciencias', '3'), ('Ciencias', '4'),
('Historia', '1'), ('Historia', '2'), ('Historia', '3'), ('Historia', '4'),
('Ingles', '1'), ('Ingles', '2'), ('Ingles', '3'), ('Ingles', '4');

INSERT IGNORE INTO usuarios (id, nombre, email, password_hash, rol, iniciales) VALUES
(1, 'Carlos Rodriguez', 'docente@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'docente', 'CR'),
(2, 'Ana Martinez', 'directivo@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'directivo', 'AM'),
(101, 'Valentina Ospina', 'v.ospina@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'VO'),
(102, 'Sebastian Mora', 's.mora@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'SM'),
(103, 'Luisa Fernandez', 'l.fernandez@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'LF'),
(104, 'Diego Salcedo', 'd.salcedo@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'DS'),
(105, 'Mariana Rios', 'estudiante@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'MR'),
(106, 'Andres Gomez', 'a.gomez@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'AG'),
(107, 'Camila Herrera', 'c.herrera@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'CH'),
(108, 'Juan Pablo Torres', 'jp.torres@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'estudiante', 'JT'),
(201, 'Maria Ospina', 'padre@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'MO'),
(202, 'Carlos Mora', 'c.mora@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'CM'),
(203, 'Pedro Fernandez', 'p.fernandez@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'PF'),
(204, 'Ana Salcedo', 'a.salcedo@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'AS'),
(205, 'Jorge Rios', 'j.rios@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'JR'),
(206, 'Laura Gomez', 'l.gomez@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'LG'),
(207, 'Rosa Herrera', 'r.herrera@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'RH'),
(208, 'Luis Torres', 'l.torres@sge.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'padre', 'LT');

INSERT IGNORE INTO estudiantes (id, nombre, curso, email, acudiente, acudiente_email, presente, justificado) VALUES
(1, 'Valentina Ospina', '9A', 'v.ospina@sge.com', 'Maria Ospina', 'padre@sge.com', 1, 0),
(2, 'Sebastian Mora', '9A', 's.mora@sge.com', 'Carlos Mora', 'c.mora@sge.com', 0, 0),
(3, 'Luisa Fernandez', '9B', 'l.fernandez@sge.com', 'Pedro Fernandez', 'p.fernandez@sge.com', 1, 0),
(4, 'Diego Salcedo', '9B', 'd.salcedo@sge.com', 'Ana Salcedo', 'a.salcedo@sge.com', 1, 0),
(5, 'Mariana Rios', '9A', 'estudiante@sge.com', 'Jorge Rios', 'j.rios@sge.com', 0, 1),
(6, 'Andres Gomez', '9C', 'a.gomez@sge.com', 'Laura Gomez', 'l.gomez@sge.com', 1, 0),
(7, 'Camila Herrera', '9C', 'c.herrera@sge.com', 'Rosa Herrera', 'r.herrera@sge.com', 1, 0),
(8, 'Juan Pablo Torres', '10A', 'jp.torres@sge.com', 'Luis Torres', 'l.torres@sge.com', 0, 0);

INSERT IGNORE INTO notas (estudiante_id, materia, periodo, nota1, nota2, nota3, ultima_modificacion)
SELECT e.id, mp.materia, mp.periodo, 3.5, 3.8, 3.6, 0
FROM estudiantes e
CROSS JOIN materias_periodos mp;

INSERT IGNORE INTO comunicados (id, titulo, mensaje, destinatario, fecha, tipo, autor) VALUES
(1, 'Entrega de boletines', 'Los boletines del periodo actual ya estan disponibles para consulta.', 'Todos los padres', '2026-05-18', 'info', 'Coordinacion'),
(2, 'Alerta academica', 'Algunos estudiantes requieren plan de mejora esta semana.', 'Grado 9A', '2026-05-17', 'alerta', 'Docente'),
(3, 'Reunion general', 'Reunion virtual de acudientes el viernes a las 6:00 PM.', 'Todos los padres', '2026-05-16', 'urgente', 'Directivo');
