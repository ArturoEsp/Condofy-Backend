-- ==============================================================================
-- SCRIPT SQL DE REINICIO DE MES DE PAGO DE UNA CASA / CONDOMINIO
-- Condofy Backend - PostgreSQL
-- ==============================================================================
-- Instrucciones:
-- 1. Especifica los datos de búsqueda:
--    - target_condo_term: Clave, nombre o ID del condominio (ej: 'RESIDENCIAL_ALBERO' o 'albero')
--    - target_house_number: Número de casa (ej: '36', '1', 'Casa 101')
--    - target_period_term: Periodo en formato 'YYYY-MM' o nombre del mes (ej: '2026-09' o 'Septiembre')
-- 2. Opcionalmente puedes proporcionar target_payment_id o target_receipt_folio.
-- 3. Ejecuta todo el bloque en psql, DBeaver, TablePlus o pgAdmin.
-- 4. La transacción eliminará los pagos del mes, recargos y revertirá el cargo a 'PENDING' con $0 pagados.
-- ==============================================================================

DO $$
DECLARE
    -- Búsqueda por condominio, casa y mes/periodo:
    target_condo_term TEXT := 'RESIDENCIAL_ALBERO'; -- Clave, nombre o ID del condominio
    target_house_number TEXT := '36';               -- Número de vivienda (ej: '36', '101')
    target_period_term TEXT := '2026-09';           -- Periodo (ej: '2026-09' o 'Septiembre')

    -- Opcional: Búsqueda directa por ID de pago o folio
    target_payment_id TEXT := NULL;
    target_receipt_folio TEXT := NULL;

    -- Variables de resolución
    v_charge_id TEXT;
    v_charge_concept TEXT;
    v_charge_base_amount NUMERIC(12, 2);
    v_charge_paid_amount NUMERIC(12, 2);
    v_charge_due_date TIMESTAMP;
    v_charge_status TEXT;
    v_proof_url TEXT;

    v_house_id TEXT;
    v_house_number TEXT;
    v_condo_id TEXT;
    v_condo_name TEXT;

    v_payments_count INT := 0;
    v_payments_total NUMERIC(12, 2) := 0;
    v_late_fees_deleted INT := 0;
    v_excess_reverted NUMERIC(12, 2) := 0;
BEGIN
    -- 1. Localizar condominio
    SELECT co.id, co.name INTO v_condo_id, v_condo_name
    FROM "Condominium" co
    WHERE co.id = target_condo_term
       OR LOWER(co.key) = LOWER(target_condo_term)
       OR co.name ILIKE '%' || target_condo_term || '%'
    LIMIT 1;

    IF v_condo_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el condominio: %', target_condo_term;
    END IF;

    -- 2. Localizar vivienda
    SELECT h.id, h."houseNumber" INTO v_house_id, v_house_number
    FROM "House" h
    WHERE h."condominiumId" = v_condo_id
      AND (
        LOWER(h."houseNumber") = LOWER(target_house_number)
        OR LOWER(h."houseNumber") = LOWER(REPLACE(target_house_number, 'Casa ', ''))
        OR LOWER(h."houseNumber") = LOWER('Casa ' || REPLACE(target_house_number, 'Casa ', ''))
      )
    LIMIT 1;

    IF v_house_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró la casa: % en condominio %', target_house_number, v_condo_name;
    END IF;

    -- 3. Localizar el cargo de mantenimiento correspondiente al periodo
    IF target_payment_id IS NOT NULL AND target_payment_id <> '' THEN
        SELECT c.id, c.concept, c.amount, c."paidAmount", c."dueDate", c.status::TEXT, c."proofUrl"
        INTO v_charge_id, v_charge_concept, v_charge_base_amount, v_charge_paid_amount, v_charge_due_date, v_charge_status, v_proof_url
        FROM "Payment" p
        JOIN "MaintenanceCharge" c ON c.id = p."maintenanceChargeId"
        WHERE p.id = target_payment_id;
    ELSIF target_receipt_folio IS NOT NULL AND target_receipt_folio <> '' THEN
        SELECT c.id, c.concept, c.amount, c."paidAmount", c."dueDate", c.status::TEXT, c."proofUrl"
        INTO v_charge_id, v_charge_concept, v_charge_base_amount, v_charge_paid_amount, v_charge_due_date, v_charge_status, v_proof_url
        FROM "Payment" p
        JOIN "MaintenanceCharge" c ON c.id = p."maintenanceChargeId"
        WHERE p."receiptFolio" = target_receipt_folio;
    ELSE
        SELECT c.id, c.concept, c.amount, c."paidAmount", c."dueDate", c.status::TEXT, c."proofUrl"
        INTO v_charge_id, v_charge_concept, v_charge_base_amount, v_charge_paid_amount, v_charge_due_date, v_charge_status, v_proof_url
        FROM "MaintenanceCharge" c
        LEFT JOIN "MaintenancePeriod" mp ON mp.id = c."maintenancePeriodId"
        WHERE c."houseId" = v_house_id
          AND (
            c.concept ILIKE '%' || target_period_term || '%'
            OR (mp.id IS NOT NULL AND (mp.year || '-' || LPAD(mp.month::TEXT, 2, '0')) = target_period_term)
          )
        ORDER BY c."dueDate" DESC
        LIMIT 1;
    END IF;

    IF v_charge_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún cargo para Casa % en el periodo %', v_house_number, target_period_term;
    END IF;

    -- 4. Contar pagos asociados
    SELECT COUNT(*), COALESCE(SUM(amount), 0)
    INTO v_payments_count, v_payments_total
    FROM "Payment"
    WHERE "maintenanceChargeId" = v_charge_id;

    RAISE NOTICE '=============================================================';
    RAISE NOTICE '💳 REINICIO DE MES DE PAGO - CASA % (%):', v_house_number, v_condo_name;
    RAISE NOTICE 'Cargo:          "%" (ID: %)', v_charge_concept, v_charge_id;
    RAISE NOTICE 'Estatus actual: % (Pagado: $%)', v_charge_status, v_charge_paid_amount;
    RAISE NOTICE 'Pagos actuales: % registro(s) por un total de $%', v_payments_count, v_payments_total;
    IF v_proof_url IS NOT NULL THEN
        RAISE NOTICE 'Comprobante R2: % (debe eliminarse de R2)', v_proof_url;
    END IF;
    RAISE NOTICE '-------------------------------------------------------------';

    -- 5. Revertir saldo a favor si los pagos generaron excedente en HouseAccount
    DECLARE
        r_mov RECORD;
    BEGIN
        FOR r_mov IN
            SELECT id, amount
            FROM "AccountMovement"
            WHERE "houseId" = v_house_id
              AND type = 'CREDIT'
              AND description LIKE '%' || v_charge_concept || '%'
        LOOP
            UPDATE "HouseAccount"
            SET "currentBalance" = GREATEST(0, "currentBalance" - r_mov.amount),
                "updatedAt" = NOW()
            WHERE "houseId" = v_house_id;

            DELETE FROM "AccountMovement" WHERE id = r_mov.id;

            v_excess_reverted := v_excess_reverted + r_mov.amount;
        END LOOP;
    END;

    -- 6. Eliminar recargos por mora en este cargo
    DELETE FROM "LateFee" WHERE "maintenanceChargeId" = v_charge_id;
    GET DIAGNOSTICS v_late_fees_deleted = ROW_COUNT;

    -- 7. Eliminar todos los registros de pago de este cargo
    DELETE FROM "Payment" WHERE "maintenanceChargeId" = v_charge_id;

    -- 8. Reiniciar completamente MaintenanceCharge a PENDING con $0
    UPDATE "MaintenanceCharge"
    SET "paidAmount" = 0,
        status = 'PENDING'::"MaintenanceChargeStatus",
        notes = NULL,
        "proofUrl" = NULL,
        "proofFileName" = NULL,
        "proofUploadedAt" = NULL,
        "proofReference" = NULL,
        "proofNotes" = NULL,
        "updatedAt" = NOW()
    WHERE id = v_charge_id;

    RAISE NOTICE '✅ Cargo reiniciado a estatus PENDING con $0 pagados.';
    RAISE NOTICE '   - % pagos eliminados.', v_payments_count;
    IF v_late_fees_deleted > 0 THEN
        RAISE NOTICE '   - % recargo(s) por mora eliminado(s).', v_late_fees_deleted;
    END IF;
    IF v_excess_reverted > 0 THEN
        RAISE NOTICE '   - $ % de saldo a favor revertido.', v_excess_reverted;
    END IF;
    RAISE NOTICE '✨ El mes de pago quedó limpio y listo para volverse a cargar.';
    RAISE NOTICE '=============================================================';
END $$;
