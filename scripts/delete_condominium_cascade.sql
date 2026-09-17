-- ==============================================================================
-- SCRIPT DE ELIMINACIÓN TOTAL EN CASCADA DE UN RESIDENCIAL / CONDOMINIO
-- Condofy Backend - PostgreSQL
-- ==============================================================================
-- Instrucciones:
-- 1. Cambia el valor de 'target_condo_term' por la 'key', el 'name' o el 'id' del condominio.
-- 2. Ejecuta todo el bloque en psql, DBeaver, TablePlus o pgAdmin.
-- 3. Si ocurre algún error en cualquier paso, la transacción se revertirá automáticamente.
-- ==============================================================================

DO $$
DECLARE
    -- Puedes buscar por key (ej: 'RESIDENCIAL_ALBERO'), nombre exacto (ej: 'Albero Residencial') o UUID
    target_condo_term TEXT := 'RESIDENCIAL_ALBERO'; -- << CAMBIA AQUÍ
    
    target_condo_id TEXT;
    target_condo_name TEXT;
    target_condo_key TEXT;
    
    target_house_ids TEXT[] := ARRAY[]::TEXT[];
    target_user_ids TEXT[] := ARRAY[]::TEXT[];
    
    cnt_logs INT := 0;
    cnt_auths INT := 0;
    cnt_visitors INT := 0;
    cnt_parcels INT := 0;
    cnt_payments INT := 0;
    cnt_late_fees INT := 0;
    cnt_charges INT := 0;
    cnt_periods INT := 0;
    cnt_movements INT := 0;
    cnt_accounts INT := 0;
    cnt_configs INT := 0;
    cnt_tokens INT := 0;
    cnt_sessions INT := 0;
    cnt_push INT := 0;
    cnt_profiles INT := 0;
    cnt_houses INT := 0;
    cnt_users INT := 0;
    cnt_condo INT := 0;
BEGIN
    -- 1. Buscar el condominio objetivo
    SELECT id, name, key 
    INTO target_condo_id, target_condo_name, target_condo_key 
    FROM "Condominium" 
    WHERE id = target_condo_term 
       OR key = target_condo_term 
       OR LOWER(name) = LOWER(target_condo_term)
    LIMIT 1;
    
    IF target_condo_id IS NULL THEN
        RAISE EXCEPTION '❌ No se encontró ningún condominio/residencial con el término: %', target_condo_term;
    END IF;

    -- 2. Obtener todas las casas del condominio
    SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::TEXT[]) 
    INTO target_house_ids 
    FROM "House" 
    WHERE "condominiumId" = target_condo_id;

    -- 3. Obtener todos los usuarios asociados al condominio:
    --    - Residentes en perfiles de este condominio o de sus casas
    --    - Usuarios con condominiumId asignado (Administradores y Caseta/Guardias)
    SELECT COALESCE(ARRAY_AGG(DISTINCT u_id), ARRAY[]::TEXT[])
    INTO target_user_ids
    FROM (
        SELECT "userId" AS u_id FROM "ResidentProfile" 
        WHERE "condominiumId" = target_condo_id OR "houseId" = ANY(target_house_ids)
        UNION
        SELECT id AS u_id FROM "User" 
        WHERE "condominiumId" = target_condo_id
    ) sub
    WHERE u_id IS NOT NULL;

    RAISE NOTICE '================================================';
    RAISE NOTICE '🏢 RESIDENCIAL ENCONTRADO: "%" (Key: % | ID: %)', target_condo_name, target_condo_key, target_condo_id;
    RAISE NOTICE '🏠 Total de casas a eliminar: %', cardinality(target_house_ids);
    RAISE NOTICE '👥 Total de usuarios (admins, caseta, residentes) a eliminar: %', cardinality(target_user_ids);
    RAISE NOTICE '⏳ Procesando eliminación total en cascada...';
    RAISE NOTICE '================================================';

    -- 4. Eliminar AccessLog
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

    -- 5. Eliminar AccessAuthorization
    WITH deleted AS (
        DELETE FROM "AccessAuthorization"
        WHERE "visitorId" IN (
            SELECT id FROM "Visitor" WHERE "houseId" = ANY(target_house_ids)
        )
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_auths FROM deleted;

    -- 6. Eliminar Visitor
    WITH deleted AS (
        DELETE FROM "Visitor"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_visitors FROM deleted;

    -- 7. Eliminar ParcelDelivery
    WITH deleted AS (
        DELETE FROM "ParcelDelivery"
        WHERE "condominiumId" = target_condo_id
           OR "houseId" = ANY(target_house_ids)
           OR "receivedById" = ANY(target_user_ids)
           OR "deliveredById" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_parcels FROM deleted;

    -- 8. Eliminar Payment
    WITH deleted AS (
        DELETE FROM "Payment"
        WHERE "maintenanceChargeId" IN (
            SELECT id FROM "MaintenanceCharge" 
            WHERE "condominiumId" = target_condo_id OR "houseId" = ANY(target_house_ids)
        )
        OR "createdById" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_payments FROM deleted;

    -- 9. Eliminar LateFee
    WITH deleted AS (
        DELETE FROM "LateFee"
        WHERE "maintenanceChargeId" IN (
            SELECT id FROM "MaintenanceCharge" 
            WHERE "condominiumId" = target_condo_id OR "houseId" = ANY(target_house_ids)
        )
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_late_fees FROM deleted;

    -- 10. Eliminar MaintenanceCharge
    WITH deleted AS (
        DELETE FROM "MaintenanceCharge"
        WHERE "condominiumId" = target_condo_id OR "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_charges FROM deleted;

    -- 11. Eliminar MaintenancePeriod
    WITH deleted AS (
        DELETE FROM "MaintenancePeriod"
        WHERE "condominiumId" = target_condo_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_periods FROM deleted;

    -- 12. Eliminar AccountMovement
    WITH deleted AS (
        DELETE FROM "AccountMovement"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_movements FROM deleted;

    -- 13. Eliminar HouseAccount
    WITH deleted AS (
        DELETE FROM "HouseAccount"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_accounts FROM deleted;

    -- 14. Eliminar HouseConfiguration
    WITH deleted AS (
        DELETE FROM "HouseConfiguration"
        WHERE "houseId" = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_configs FROM deleted;

    -- 15. Eliminar PushSubscription
    WITH deleted AS (
        DELETE FROM "PushSubscription"
        WHERE "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_push FROM deleted;

    -- 16. Eliminar UserSession
    WITH deleted AS (
        DELETE FROM "UserSession"
        WHERE "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_sessions FROM deleted;

    -- 17. Eliminar PasswordResetToken
    WITH deleted AS (
        DELETE FROM "PasswordResetToken"
        WHERE "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_tokens FROM deleted;

    -- 18. Eliminar ResidentProfile
    WITH deleted AS (
        DELETE FROM "ResidentProfile"
        WHERE "condominiumId" = target_condo_id
           OR "houseId" = ANY(target_house_ids)
           OR "userId" = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_profiles FROM deleted;

    -- 19. Eliminar Casas
    WITH deleted AS (
        DELETE FROM "House"
        WHERE "condominiumId" = target_condo_id OR id = ANY(target_house_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_houses FROM deleted;

    -- 20. Eliminar Usuarios
    WITH deleted AS (
        DELETE FROM "User"
        WHERE id = ANY(target_user_ids)
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_users FROM deleted;

    -- 21. Eliminar el Condominio
    WITH deleted AS (
        DELETE FROM "Condominium"
        WHERE id = target_condo_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_condo FROM deleted;

    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE '✅ ELIMINACIÓN EXITOSA DEL RESIDENCIAL (CERO RASTRO):';
    RAISE NOTICE '   - Logs de acceso: %', cnt_logs;
    RAISE NOTICE '   - Autorizaciones: %', cnt_auths;
    RAISE NOTICE '   - Visitantes: %', cnt_visitors;
    RAISE NOTICE '   - Paquetes: %', cnt_parcels;
    RAISE NOTICE '   - Pagos: %', cnt_payments;
    RAISE NOTICE '   - Recargos moratorios: %', cnt_late_fees;
    RAISE NOTICE '   - Cargos de mantenimiento: %', cnt_charges;
    RAISE NOTICE '   - Periodos de mantenimiento: %', cnt_periods;
    RAISE NOTICE '   - Movimientos contables: %', cnt_movements;
    RAISE NOTICE '   - Cuentas de casa: %', cnt_accounts;
    RAISE NOTICE '   - Configuraciones de casa: %', cnt_configs;
    RAISE NOTICE '   - Sesiones / Tokens / Push: % / % / %', cnt_sessions, cnt_tokens, cnt_push;
    RAISE NOTICE '   - Perfiles de residente: %', cnt_profiles;
    RAISE NOTICE '   - Casas eliminadas: %', cnt_houses;
    RAISE NOTICE '   - Usuarios eliminados (admins, caseta, residentes): %', cnt_users;
    RAISE NOTICE '   - Condominio eliminado: % ("%")', cnt_condo, target_condo_name;
    RAISE NOTICE '------------------------------------------------';
END $$;

