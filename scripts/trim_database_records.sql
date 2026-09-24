-- ==============================================================================
-- SCRIPT SQL DE SANITIZACIÓN Y LIMPIEZA DE ESPACIOS (TRIM) EN REGISTROS
-- Condofy Backend - PostgreSQL
-- ==============================================================================
-- Ejecuta este script en tu cliente de PostgreSQL (psql, DBeaver, TablePlus, pgAdmin)
-- para remover espacios accidentales al inicio y final de campos de texto.
-- ==============================================================================

BEGIN;

-- 1. Limpieza de Condominios (Nombre, Calle/Dirección, Descripción, Teléfono, Email)
UPDATE "Condominium"
SET
  name = TRIM(name),
  address = CASE WHEN address IS NOT NULL THEN TRIM(address) ELSE NULL END,
  description = CASE WHEN description IS NOT NULL THEN TRIM(description) ELSE NULL END,
  "contactPhone" = CASE WHEN "contactPhone" IS NOT NULL THEN TRIM("contactPhone") ELSE NULL END,
  "contactEmail" = CASE WHEN "contactEmail" IS NOT NULL THEN LOWER(TRIM("contactEmail")) ELSE NULL END
WHERE name <> TRIM(name)
   OR (address IS NOT NULL AND address <> TRIM(address))
   OR (description IS NOT NULL AND description <> TRIM(description))
   OR ("contactPhone" IS NOT NULL AND "contactPhone" <> TRIM("contactPhone"))
   OR ("contactEmail" IS NOT NULL AND "contactEmail" <> LOWER(TRIM("contactEmail")));

-- 2. Limpieza de Casas / Viviendas (Número de casa y Torre)
UPDATE "House"
SET
  "houseNumber" = TRIM("houseNumber"),
  tower = CASE WHEN tower IS NOT NULL THEN TRIM(tower) ELSE NULL END
WHERE "houseNumber" <> TRIM("houseNumber")
   OR (tower IS NOT NULL AND tower <> TRIM(tower));

-- 3. Limpieza de Perfiles de Residentes (Nombre, Apellidos, Teléfono, Comentarios)
UPDATE "ResidentProfile"
SET
  "firstName" = TRIM("firstName"),
  "lastName" = TRIM("lastName"),
  phone = CASE WHEN phone IS NOT NULL THEN TRIM(phone) ELSE NULL END,
  comments = CASE WHEN comments IS NOT NULL THEN TRIM(comments) ELSE NULL END
WHERE "firstName" <> TRIM("firstName")
   OR "lastName" <> TRIM("lastName")
   OR (phone IS NOT NULL AND phone <> TRIM(phone))
   OR (comments IS NOT NULL AND comments <> TRIM(comments));

-- 4. Limpieza de Usuarios (Nombre, Apellidos, Email, Teléfono)
UPDATE "User"
SET
  "firstName" = CASE WHEN "firstName" IS NOT NULL THEN TRIM("firstName") ELSE NULL END,
  "lastName" = CASE WHEN "lastName" IS NOT NULL THEN TRIM("lastName") ELSE NULL END,
  email = LOWER(TRIM(email)),
  phone = CASE WHEN phone IS NOT NULL THEN TRIM(phone) ELSE NULL END
WHERE ("firstName" IS NOT NULL AND "firstName" <> TRIM("firstName"))
   OR ("lastName" IS NOT NULL AND "lastName" <> TRIM("lastName"))
   OR email <> LOWER(TRIM(email))
   OR (phone IS NOT NULL AND phone <> TRIM(phone));

-- 5. Limpieza de Visitantes (Nombre, Apellidos, Teléfono, Placas de vehículo)
UPDATE "Visitor"
SET
  "firstName" = TRIM("firstName"),
  "lastName" = CASE WHEN "lastName" IS NOT NULL THEN TRIM("lastName") ELSE NULL END,
  phone = CASE WHEN phone IS NOT NULL THEN TRIM(phone) ELSE NULL END,
  "vehiclePlate" = CASE WHEN "vehiclePlate" IS NOT NULL THEN TRIM("vehiclePlate") ELSE NULL END
WHERE "firstName" <> TRIM("firstName")
   OR ("lastName" IS NOT NULL AND "lastName" <> TRIM("lastName"))
   OR (phone IS NOT NULL AND phone <> TRIM(phone))
   OR ("vehiclePlate" IS NOT NULL AND "vehiclePlate" <> TRIM("vehiclePlate"));

-- 6. Limpieza de Configuración Bancaria y de Cobranza
UPDATE "CondominiumBillingConfig"
SET
  "bankName" = CASE WHEN "bankName" IS NOT NULL THEN TRIM("bankName") ELSE NULL END,
  "accountHolder" = CASE WHEN "accountHolder" IS NOT NULL THEN TRIM("accountHolder") ELSE NULL END,
  clabe = CASE WHEN clabe IS NOT NULL THEN TRIM(clabe) ELSE NULL END,
  "accountNumber" = CASE WHEN "accountNumber" IS NOT NULL THEN TRIM("accountNumber") ELSE NULL END
WHERE ("bankName" IS NOT NULL AND "bankName" <> TRIM("bankName"))
   OR ("accountHolder" IS NOT NULL AND "accountHolder" <> TRIM("accountHolder"))
   OR (clabe IS NOT NULL AND clabe <> TRIM(clabe))
   OR ("accountNumber" IS NOT NULL AND "accountNumber" <> TRIM("accountNumber"));

COMMIT;
