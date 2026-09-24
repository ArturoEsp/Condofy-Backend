-- ==============================================================================
-- SCRIPT DE ELIMINACIÓN EN CASCADA COMPLETA DE UNA CASA / VIVIENDA
-- Condofy Backend - PostgreSQL
-- ==============================================================================
-- Instrucciones:
-- 1. Puedes especificar el condominio y el número de casa en las variables:
--    - target_condo_term: Key (ej: 'albero'), ID o nombre del condominio.
--    - target_house_number: Número de casa (ej: '102', 'Lote 15').
--    - O si conoces el UUID directo de la casa, asígnalo en target_house_id.
-- 2. Ejecuta todo el bloque en psql, DBeaver, TablePlus o pgAdmin.
-- 3. Si ocurre algún error en cualquier paso, la transacción se revertirá (ROLLBACK).
-- ==============================================================================

DO $$
DECLARE
    -- Opción A: Búsqueda por condominio y número de casa
    target_condo_term TEXT := 'RESIDENCIAL_ALBERO'; -- << Clave, ID o Nombre del condominio
    target_house_number TEXT := '102';              -- << Número de la vivienda a eliminar

    -- Opción B: Si conoces el UUID exacto de la vivienda (deja en NULL si usas la Opción A)
    target_house_id TEXT := NULL;

    -- Variables de resolución interna
    v_condo_id TEXT;
    v_condo_name TEXT;
    v_house_id TEXT;
    v_house_number TEXT;
    
    target_user_ids TEXT[] := ARRAY[]::TEXT[];
    target_visitor_ids TEXT[] := ARRAY[]::TEXT[];
    target_auth_ids TEXT[] := ARRAY[]::TEXT[];
    target_charge_ids TEXT[] := ARRAY[]::TEXT[];
    
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
    cnt_users INT := 0;
    cnt_houses INT := 0;
BEGIN
    -- 1. Resolver el ID de la vivienda
    IF target_house_id IS NOT NULL AND target_house_id <> '' THEN
        SELECT h.id, h."houseNumber", c.id, c.name
        INTO v_house_id, v_house_number, v_condo_id, v_condo_name
        FROM "House" h
        JOIN "Condominium" c ON c.id = h."condominiumId"
        WHERE h.id = target_house_id;
    ELSE
        -- Buscar condominio
        SELECT id, name INTO v_condo_id, v_condo_name
        FROM "Condominium"
        WHERE id = target_condo_term
           OR key = target_condo_term
           OR LOWER(name) = LOWER(target_condo_term)
        LIMIT 1;

        IF v_condo_id IS NULL THEN
            RAISE EXCEPTION '❌ No se encontró ningún condominio con el término: %', target_condo_term;
        END IF;

        -- Buscar casa dentro del condominio
        SELECT id, "houseNumber" INTO v_house_id, v_house_number
        FROM "House"
        WHERE "condominiumId" = v_condo_id
          AND LOWER("houseNumber") = LOWER(target_house_number)
        LIMIT 1;
    END IF;

    IF v_house_id IS NULL THEN
        RAISE EXCEPTION '❌ No se encontró la casa "%" en el condominio "%"', target_house_number, v_condo_name;
    END IF;

    -- 2. Identificar usuarios residentes exclusivos de esta vivienda (sin rol ADMIN y sin otras casas)
    SELECT COALESCE(ARRAY_AGG(DISTINCT rp."userId"), ARRAY[]::TEXT[])
    INTO target_user_ids
    FROM "ResidentProfile" rp
    JOIN "User" u ON u.id = rp."userId"
    WHERE rp."houseId" = v_house_id
      AND u.role = 'RESIDENT'
      AND (
          SELECT COUNT(*) 
          FROM "ResidentProfile" rp_other 
          WHERE rp_other."userId" = rp."userId" 
            AND rp_other."houseId" <> v_house_id
      ) = 0;

    -- 3. Identificar visitantes y autorizaciones de esta casa
    SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::TEXT[])
    INTO target_visitor_ids
    FROM "Visitor"
    WHERE "houseId" = v_house_id;

    IF cardinality(target_visitor_ids) > 0 THEN
        SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::TEXT[])
        INTO target_auth_ids
        FROM "AccessAuthorization"
        WHERE "visitorId" = ANY(target_visitor_ids);
    END IF;

    -- 4. Identificar cargos de mantenimiento
    SELECT COALESCE(ARRAY_AGG(id), ARRAY[]::TEXT[])
    INTO target_charge_ids
    FROM "MaintenanceCharge"
    WHERE "houseId" = v_house_id;

    RAISE NOTICE '================================================';
    RAISE NOTICE '🏢 Condominio : % (ID: %)', v_condo_name, v_condo_id;
    RAISE NOTICE '🏠 Vivienda   : % (ID: %)', v_house_number, v_house_id;
    RAISE NOTICE '👥 Usuarios residentes a eliminar : %', cardinality(target_user_ids);
    RAISE NOTICE '⏳ Procesando eliminación en cascada completa...';
    RAISE NOTICE '================================================';

    -- 5. Eliminar AccessLog
    WITH deleted AS (
        DELETE FROM "AccessLog"
        WHERE (cardinality(target_auth_ids) > 0 AND "accessAuthorizationId" = ANY(target_auth_ids))
           OR (cardinality(target_user_ids) > 0 AND "userAcceptId" = ANY(target_user_ids))
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_logs FROM deleted;

    -- 6. Eliminar AccessAuthorization
    IF cardinality(target_visitor_ids) > 0 THEN
        WITH deleted AS (
            DELETE FROM "AccessAuthorization"
            WHERE "visitorId" = ANY(target_visitor_ids)
            RETURNING *
        )
        SELECT COUNT(*) INTO cnt_auths FROM deleted;
    END IF;

    -- 7. Eliminar Visitor
    WITH deleted AS (
        DELETE FROM "Visitor"
        WHERE "houseId" = v_house_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_visitors FROM deleted;

    -- 8. Eliminar ParcelDelivery
    WITH deleted AS (
        DELETE FROM "ParcelDelivery"
        WHERE "houseId" = v_house_id
           OR (cardinality(target_user_ids) > 0 AND (
               "receivedById" = ANY(target_user_ids) OR "deliveredById" = ANY(target_user_ids)
           ))
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_parcels FROM deleted;

    -- 9. Eliminar Payments y LateFees
    IF cardinality(target_charge_ids) > 0 OR cardinality(target_user_ids) > 0 THEN
        WITH deleted AS (
            DELETE FROM "Payment"
            WHERE (cardinality(target_charge_ids) > 0 AND "maintenanceChargeId" = ANY(target_charge_ids))
               OR (cardinality(target_user_ids) > 0 AND "createdById" = ANY(target_user_ids))
            RETURNING *
        )
        SELECT COUNT(*) INTO cnt_payments FROM deleted;

        IF cardinality(target_charge_ids) > 0 THEN
            WITH deleted AS (
                DELETE FROM "LateFee"
                WHERE "maintenanceChargeId" = ANY(target_charge_ids)
                RETURNING *
            )
            SELECT COUNT(*) INTO cnt_late_fees FROM deleted;
        END IF;
    END IF;

    -- 10. Eliminar MaintenanceCharge
    WITH deleted AS (
        DELETE FROM "MaintenanceCharge"
        WHERE "houseId" = v_house_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_charges FROM deleted;

    -- 11. Eliminar AccountMovement
    WITH deleted AS (
        DELETE FROM "AccountMovement"
        WHERE "houseId" = v_house_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_movements FROM deleted;

    -- 12. Eliminar HouseAccount
    WITH deleted AS (
        DELETE FROM "HouseAccount"
        WHERE "houseId" = v_house_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_accounts FROM deleted;

    -- 13. Eliminar HouseConfiguration
    WITH deleted AS (
        DELETE FROM "HouseConfiguration"
        WHERE "houseId" = v_house_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_configs FROM deleted;

    -- 14. Limpiar tokens, sesiones y suscripciones push de usuarios a eliminar
    IF cardinality(target_user_ids) > 0 THEN
        WITH deleted AS (
            DELETE FROM "PasswordResetToken"
            WHERE "userId" = ANY(target_user_ids)
            RETURNING *
        )
        SELECT COUNT(*) INTO cnt_tokens FROM deleted;

        WITH deleted AS (
            DELETE FROM "UserSession"
            WHERE "userId" = ANY(target_user_ids)
            RETURNING *
        )
        SELECT COUNT(*) INTO cnt_sessions FROM deleted;

        WITH deleted AS (
            DELETE FROM "PushSubscription"
            WHERE "userId" = ANY(target_user_ids)
            RETURNING *
        )
        SELECT COUNT(*) INTO cnt_push FROM deleted;
    END IF;

    -- 15. Eliminar ResidentProfile vinculados a esta vivienda
    WITH deleted AS (
        DELETE FROM "ResidentProfile"
        WHERE "houseId" = v_house_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_profiles FROM deleted;

    -- 16. Eliminar usuarios residentes que quedaron sin viviendas
    IF cardinality(target_user_ids) > 0 THEN
        WITH deleted AS (
            DELETE FROM "User"
            WHERE id = ANY(target_user_ids)
            RETURNING *
        )
        SELECT COUNT(*) INTO cnt_users FROM deleted;
    END IF;

    -- 17. Eliminar la vivienda (House)
    WITH deleted AS (
        DELETE FROM "House"
        WHERE id = v_house_id
        RETURNING *
    )
    SELECT COUNT(*) INTO cnt_houses FROM deleted;

    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE '📋 RESUMEN DE REGISTROS ELIMINADOS:';
    RAISE NOTICE '   - Logs de acceso       : %', cnt_logs;
    RAISE NOTICE '   - Autorizaciones       : %', cnt_auths;
    RAISE NOTICE '   - Visitantes           : %', cnt_visitors;
    RAISE NOTICE '   - Paquetes en caseta   : %', cnt_parcels;
    RAISE NOTICE '   - Pagos de cuotas      : %', cnt_payments;
    RAISE NOTICE '   - Recargos por mora    : %', cnt_late_fees;
    RAISE NOTICE '   - Cargos cuotas        : %', cnt_charges;
    RAISE NOTICE '   - Movimientos cta      : %', cnt_movements;
    RAISE NOTICE '   - Cuenta de vivienda   : %', cnt_accounts;
    RAISE NOTICE '   - Configuración casa   : %', cnt_configs;
    RAISE NOTICE '   - Tokens y sesiones    : %', (cnt_tokens + cnt_sessions + cnt_push);
    RAISE NOTICE '   - Perfiles de residente: %', cnt_profiles;
    RAISE NOTICE '   - Usuarios residentes  : %', cnt_users;
    RAISE NOTICE '   - Viviendas (House)    : %', cnt_houses;
    RAISE NOTICE '------------------------------------------------';
    RAISE NOTICE '✅ Casa "%" y todas sus relaciones eliminadas con éxito.', v_house_number;
END $$;
