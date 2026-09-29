-- =====================================================================
-- 🛡️ CONDOFY - Script SQL para Reparación de Pases Permanentes Afectados
-- =====================================================================
-- Este script identifica y repara las autorizaciones de acceso tipo 'PERMANENT'
-- que fueron guardadas con "maxEntries" = 1 debido al bug del frontend, y que
-- quedaron bloqueadas en status 'USED' tras el primer ingreso en caseta.

-- 1. CONSULTA DE DIAGNÓSTICO (Ejecutar para previsualizar antes de modificar):
SELECT 
    CONCAT('ACC-', LPAD(a.index::text, 4, '0')) AS codigo_pase,
    a."qrCode" AS pin_qr,
    a.type AS tipo,
    a.status AS estatus_actual,
    a."maxEntries" AS limite_entradas,
    a."usedEntries" AS entradas_usadas,
    CONCAT(v."firstName", ' ', COALESCE(v."lastName", '')) AS visitante,
    h."houseNumber" AS casa,
    c.name AS condominio,
    a."createdAt" AS fecha_creacion
FROM "AccessAuthorization" a
JOIN "Visitor" v ON a."visitorId" = v.id
JOIN "House" h ON v."houseId" = h.id
JOIN "Condominium" c ON h."condominiumId" = c.id
WHERE a.type = 'PERMANENT'
  AND a."maxEntries" = 1
ORDER BY a."createdAt" DESC;

-- 2. REACTIVAR PASES BLOQUEADOS ('USED' -> 'ACTIVE') Y VOLVERLOS ILIMITADOS:
UPDATE "AccessAuthorization"
SET "maxEntries" = NULL,
    "status" = 'ACTIVE',
    "updatedAt" = NOW()
WHERE type = 'PERMANENT'
  AND "maxEntries" = 1
  AND status = 'USED';

-- 3. QUITAR LÍMITE A LOS PASES PERMANENTES ACTIVOS QUE NO SE HABÍAN USADO:
UPDATE "AccessAuthorization"
SET "maxEntries" = NULL,
    "updatedAt" = NOW()
WHERE type = 'PERMANENT'
  AND "maxEntries" = 1
  AND status != 'USED';
