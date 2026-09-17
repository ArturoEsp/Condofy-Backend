-- ==============================================================================
-- SCRIPT DE ELIMINACIÓN EN CASCADA COMPLETA DE RESIDENTE Y SUS CASAS
-- Condofy Backend - PostgreSQL
-- ==============================================================================
-- Instrucciones:
-- 1. Cambia el valor de 'target_email' por el correo del residente a eliminar.
-- 2. Ejecuta todo el bloque en psql, DBeaver, TablePlus o pgAdmin.
-- 3. Si ocurre algún error, la transacción se revertirá automáticamente (ROLLBACK).
-- ==============================================================================

DO $$
DECLARE
    target_email TEXT := 'residente@ejemplo.com'; -- << COLOCA AQUÍ EL CORREO A ELIMINAR
    
    target_user_id TEXT;
    target_role TEXT;
    target_house_ids TEXT[] := ARRAY[]::TEXT[];
    target_user_ids TEXT[] := ARRAY[]::TEXT[];
    
    cnt_logs INT := 0;
    cnt_auths INT := 0;
    cnt_visitors INT := 0;
    cnt_parcels INT := 0;
    cnt_payments INT := 0;
    cnt_late_fees INT := 0;
    cnt_charges INT := 0;
    cnt_movements INT := 0;
    cnt_accounts INT := 0;
    cnt_configs INT := 0;
    cnt_tokens INT := 0;
    cnt_sessions INT := 0;
    cnt_push INT := 0;
    cnt_profiles INT := 0;
    cnt_houses INT := 0;
    cnt_users INT := 0;
BEGIN
    -- 1. Buscar el usuario objetivo por email
    SELECT id, role INTO target_user_id, target_role FROM "User" WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION '❌ No se encontró ningún usuario con el correo: %', target_email;
    END IF;

    IF target_role = 'ADMIN' THEN
        RAISE EXCEPTION '🛑 Operación cancelada: El usuario % es un ADMIN. Este script es exclusivo para residentes.', target_email;
    END IF;

    -- 2. Obtener todas las casas asociadas al residente
    SELECT COALESCE(ARRAY_AGG(DISTINCT "houseId"), ARRAY[]::TEXT[]) INTO target_house_ids
    FROM "ResidentProfile"
    WHERE "userId" = target_user_id;

    -- 3. Obtener todos los usuarios asociados a esas casas (residentes, inquilinos, familiares)
    SELECT COALESCE(ARRAY_AGG(DISTINCT "userId"), ARRAY[]::TEXT[]) INTO target_user_ids
    FROM "ResidentProfile"
    WHERE ("houseId" = ANY(target_house_ids) OR "userId" = target_user_id)
      AND "userId" IS NOT NULL;

    -- Asegurar que el usuario principal esté en la lista
    IF NOT (target_user_id = ANY(target_user_ids)) THEN
        target_user_ids := array_append(target_user_ids, target_user_id);
    END IF;

    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE '🔍 Residente: % (ID: %)', target_email, target_user_id;
    RAISE NOTICE '🏠 Casas vinculadas: %', target_house_ids;
    RAISE NOTICE '👥 Usuarios vinculados: %', target_user_ids;
    RAISE NOTICE '⏳ Procesando eliminación en cascada...';

    -- 4. Eliminar AccessLog (logs de accesos de visitas de estas casas o aceptados por estos usuarios)
    WITH deleted AS (
        DELETE FROM "AccessLog"
        WHERE "accessAuthorizationId" IN (
            SELECT aa.id FROM "AccessAuthorization" aa
            JOIN "Visitor" v ON v.id = aa."visitorId"
            WHERE v."houseId" = ANY(target_house_ids)
        )
        OR "userAcceptId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_logs FROM deleted;

    -- 5. Eliminar AccessAuthorization (autorizaciones de visitantes de estas casas)
    WITH deleted AS (
        DELETE FROM "AccessAuthorization"
        WHERE "visitorId" IN (
            SELECT id FROM "Visitor" WHERE "houseId" = ANY(target_house_ids)
        )
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_auths FROM deleted;

    -- 6. Eliminar Visitor (visitantes de estas casas)
    WITH deleted AS (
        DELETE FROM "Visitor"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_visitors FROM deleted;

    -- 7. Eliminar ParcelDelivery (paquetes de estas casas o recibidos/entregados por estos usuarios)
    WITH deleted AS (
        DELETE FROM "ParcelDelivery"
        WHERE "houseId" = ANY(target_house_ids)
           OR "receivedById" = ANY(target_user_ids)
           OR "deliveredById" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_parcels FROM deleted;

    -- 8. Eliminar Payment (pagos vinculados a cargos de estas casas o registrados por estos usuarios)
    WITH deleted AS (
        DELETE FROM "Payment"
        WHERE "maintenanceChargeId" IN (
            SELECT id FROM "MaintenanceCharge" WHERE "houseId" = ANY(target_house_ids)
        )
        OR "createdById" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_payments FROM deleted;

    -- 9. Eliminar LateFee (recargos por mora en cargos de estas casas)
    WITH deleted AS (
        DELETE FROM "LateFee"
        WHERE "maintenanceChargeId" IN (
            SELECT id FROM "MaintenanceCharge" WHERE "houseId" = ANY(target_house_ids)
        )
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_late_fees FROM deleted;

    -- 10. Eliminar MaintenanceCharge (cargos de mantenimiento de estas casas)
    WITH deleted AS (
        DELETE FROM "MaintenanceCharge"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_charges FROM deleted;

    -- 11. Eliminar AccountMovement (movimientos de saldo de estas casas)
    WITH deleted AS (
        DELETE FROM "AccountMovement"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_movements FROM deleted;

    -- 12. Eliminar HouseAccount (cuenta financiera de estas casas)
    WITH deleted AS (
        DELETE FROM "HouseAccount"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_accounts FROM deleted;

    -- 13. Eliminar HouseConfiguration (configuración de estas casas)
    WITH deleted AS (
        DELETE FROM "HouseConfiguration"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_configs FROM deleted;

    -- 14. Eliminar PushSubscription (suscripciones a notificaciones)
    WITH deleted AS (
        DELETE FROM "PushSubscription"
        WHERE "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_push FROM deleted;

    -- 15. Eliminar UserSession (sesiones activas)
    WITH deleted AS (
        DELETE FROM "UserSession"
        WHERE "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_sessions FROM deleted;

    -- 16. Eliminar PasswordResetToken (tokens de recuperación de contraseña)
    WITH deleted AS (
        DELETE FROM "PasswordResetToken"
        WHERE "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_tokens FROM deleted;

    -- 17. Eliminar ResidentProfile (perfiles de residentes)
    WITH deleted AS (
        DELETE FROM "ResidentProfile"
        WHERE "houseId" = ANY(target_house_ids)
           OR "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_profiles FROM deleted;

    -- 18. Eliminar las Casas
    WITH deleted AS (
        DELETE FROM "House"
        WHERE id = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_houses FROM deleted;

    -- 19. Eliminar los Usuarios
    WITH deleted AS (
        DELETE FROM "User"
        WHERE id = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_users FROM deleted;

    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE '✅ ELIMINACIÓN EXITOSA (CERO RASTRO):';
    RAISE NOTICE '   - Logs de acceso eliminados: %', cnt_logs;
    RAISE NOTICE '   - Autorizaciones eliminadas: %', cnt_auths;
    RAISE NOTICE '   - Visitantes eliminados: %', cnt_visitors;
    RAISE NOTICE '   - Paquetes eliminados: %', cnt_parcels;
    RAISE NOTICE '   - Pagos eliminados: %', cnt_payments;
    RAISE NOTICE '   - Recargos por mora eliminados: %', cnt_late_fees;
    RAISE NOTICE '   - Cargos de mantenimiento eliminados: %', cnt_charges;
    RAISE NOTICE '   - Movimientos contables eliminados: %', cnt_movements;
    RAISE NOTICE '   - Cuentas de casa eliminadas: %', cnt_accounts;
    RAISE NOTICE '   - Configuraciones de casa eliminadas: %', cnt_configs;
    RAISE NOTICE '   - Sesiones / Tokens / Push eliminados: % / % / %', cnt_sessions, cnt_tokens, cnt_push;
    RAISE NOTICE '   - Perfiles de residente eliminados: %', cnt_profiles;
    RAISE NOTICE '   - Casas eliminadas: %', cnt_houses;
    RAISE NOTICE '   - Cuentas de usuario eliminadas: %', cnt_users;
    RAISE NOTICE '------------------------------------------------';
END $$;

