-- ==============================================================================
-- SCRIPT SQL DE ELIMINACIÓN DE UN PAGO DE UNA CASA / CONDOMINIO
-- Condofy Backend - PostgreSQL
-- ==============================================================================
-- Instrucciones:
-- 1. Puedes especificar el pago a eliminar por cualquiera de las siguientes opciones:
--    - Opción A: Proporcionar target_payment_id o target_receipt_folio.
--    - Opción B: Proporcionar target_condo_term + target_house_number + target_period_term.
-- 2. Ejecuta todo el bloque en psql, DBeaver, TablePlus o pgAdmin.
-- 3. La transacción recalculará el paidAmount y el status del cargo (PAID, PARTIAL, PENDING u OVERDUE).
-- 4. Si ocurre cualquier error, la transacción se revertirá (ROLLBACK).
-- ==============================================================================

DO $$
DECLARE
    -- Opción A: Identificador directo del pago o folio
    target_payment_id TEXT := NULL;       -- UUID del pago en tabla "Payment"
    target_receipt_folio TEXT := NULL;    -- Folio del recibo (ej: 'REC-101-123456')

    -- Opción B: Búsqueda por condominio, casa y periodo
    target_condo_term TEXT := 'RESIDENCIAL_ALBERO'; -- Clave, nombre o ID del condominio
    target_house_number TEXT := '101';              -- Número de vivienda (ej: '101', 'Casa 12')
    target_period_term TEXT := '2026-09';           -- Periodo (ej: '2026-09' o parte del concepto)

    -- Variables de resolución
    v_payment_id TEXT;
    v_payment_amount NUMERIC(12, 2);
    v_payment_date TIMESTAMP;
    v_payment_folio TEXT;
    v_receipt_url TEXT;

    v_charge_id TEXT;
    v_charge_concept TEXT;
    v_charge_base_amount NUMERIC(12, 2);
    v_charge_paid_amount NUMERIC(12, 2);
    v_charge_due_date TIMESTAMP;
    v_charge_status TEXT;

    v_house_id TEXT;
    v_house_number TEXT;
    v_condo_id TEXT;
    v_condo_name TEXT;

    v_late_fees_total NUMERIC(12, 2) := 0;
    v_total_due NUMERIC(12, 2) := 0;
    v_new_paid_amount NUMERIC(12, 2) := 0;
    v_new_status TEXT;

    v_excess_reverted NUMERIC(12, 2) := 0;
BEGIN
    -- 1. Localizar el pago objetivo
    IF target_payment_id IS NOT NULL AND target_payment_id <> '' THEN
        SELECT p.id, p.amount, p."paymentDate", p."receiptFolio", p."receiptUrl",
               c.id, c.concept, c.amount, c."paidAmount", c."dueDate", c.status::TEXT,
               h.id, h."houseNumber", co.id, co.name
        INTO v_payment_id, v_payment_amount, v_payment_date, v_payment_folio, v_receipt_url,
             v_charge_id, v_charge_concept, v_charge_base_amount, v_charge_paid_amount, v_charge_due_date, v_charge_status,
             v_house_id, v_house_number, v_condo_id, v_condo_name
        FROM "Payment" p
        JOIN "MaintenanceCharge" c ON c.id = p."maintenanceChargeId"
        JOIN "House" h ON h.id = c."houseId"
        JOIN "Condominium" co ON co.id = c."condominiumId"
        WHERE p.id = target_payment_id;
    ELSIF target_receipt_folio IS NOT NULL AND target_receipt_folio <> '' THEN
        SELECT p.id, p.amount, p."paymentDate", p."receiptFolio", p."receiptUrl",
               c.id, c.concept, c.amount, c."paidAmount", c."dueDate", c.status::TEXT,
               h.id, h."houseNumber", co.id, co.name
        INTO v_payment_id, v_payment_amount, v_payment_date, v_payment_folio, v_receipt_url,
             v_charge_id, v_charge_concept, v_charge_base_amount, v_charge_paid_amount, v_charge_due_date, v_charge_status,
             v_house_id, v_house_number, v_condo_id, v_condo_name
        FROM "Payment" p
        JOIN "MaintenanceCharge" c ON c.id = p."maintenanceChargeId"
        JOIN "House" h ON h.id = c."houseId"
        JOIN "Condominium" co ON co.id = c."condominiumId"
        WHERE p."receiptFolio" = target_receipt_folio;
    ELSE
        -- Buscar por Condominio + Casa + Periodo/Concepto
        SELECT co.id, co.name INTO v_condo_id, v_condo_name
        FROM "Condominium" co
        WHERE co.id = target_condo_term
           OR LOWER(co.key) = LOWER(target_condo_term)
           OR co.name ILIKE '%' || target_condo_term || '%'
        LIMIT 1;

        IF v_condo_id IS NULL THEN
            RAISE EXCEPTION 'No se encontró el condominio: %', target_condo_term;
        END IF;

        SELECT h.id, h."houseNumber" INTO v_house_id, v_house_number
        FROM "House" h
        WHERE h."condominiumId" = v_condo_id
          AND (
            LOWER(h."houseNumber") = LOWER(target_house_number)
            OR LOWER(h."houseNumber") = LOWER(REPLACE(target_house_number, 'Casa ', ''))
          )
        LIMIT 1;

        IF v_house_id IS NULL THEN
            RAISE EXCEPTION 'No se encontró la casa: % en condominio %', target_house_number, v_condo_name;
        END IF;

        SELECT p.id, p.amount, p."paymentDate", p."receiptFolio", p."receiptUrl",
               c.id, c.concept, c.amount, c."paidAmount", c."dueDate", c.status::TEXT
        INTO v_payment_id, v_payment_amount, v_payment_date, v_payment_folio, v_receipt_url,
             v_charge_id, v_charge_concept, v_charge_base_amount, v_charge_paid_amount, v_charge_due_date, v_charge_status
        FROM "Payment" p
        JOIN "MaintenanceCharge" c ON c.id = p."maintenanceChargeId"
        LEFT JOIN "MaintenancePeriod" mp ON mp.id = c."maintenancePeriodId"
        WHERE c."houseId" = v_house_id
          AND (
            c.concept ILIKE '%' || target_period_term || '%'
            OR (mp.id IS NOT NULL AND (mp.year || '-' || LPAD(mp.month::TEXT, 2, '0')) = target_period_term)
          )
        ORDER BY p."paymentDate" DESC
        LIMIT 1;
    END IF;

    IF v_payment_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún pago que coincida con los criterios.';
    END IF;

    RAISE NOTICE '=============================================================';
    RAISE NOTICE '💳 PAGO IDENTIFICADO PARA ELIMINACIÓN:';
    RAISE NOTICE 'Condominio:    % (%)', v_condo_name, v_condo_id;
    RAISE NOTICE 'Vivienda:      Casa % (ID: %)', v_house_number, v_house_id;
    RAISE NOTICE 'Cargo:         "%" (ID: %)', v_charge_concept, v_charge_id;
    RAISE NOTICE 'Pago ID:       %', v_payment_id;
    RAISE NOTICE 'Folio Recibo:  %', COALESCE(v_payment_folio, 'Sin Folio');
    RAISE NOTICE 'Monto Pago:    $%', v_payment_amount;
    RAISE NOTICE 'Fecha Pago:    %', v_payment_date;
    IF v_receipt_url IS NOT NULL THEN
        RAISE NOTICE 'Recibo en R2:  % (debe eliminarse de Cloudflare R2)', v_receipt_url;
    END IF;
    RAISE NOTICE '-------------------------------------------------------------';

    -- 2. Calcular recargos por mora en el cargo
    SELECT COALESCE(SUM(amount), 0)
    INTO v_late_fees_total
    FROM "LateFee"
    WHERE "maintenanceChargeId" = v_charge_id;

    v_total_due := v_charge_base_amount + v_late_fees_total;

    -- 3. Calcular el nuevo monto pagado sumando todos los pagos restantes en este cargo
    SELECT COALESCE(SUM(amount), 0)
    INTO v_new_paid_amount
    FROM "Payment"
    WHERE "maintenanceChargeId" = v_charge_id
      AND id <> v_payment_id;

    -- 4. Determinar nuevo estatus del cargo
    IF v_new_paid_amount >= v_total_due THEN
        v_new_status := 'PAID';
    ELSIF v_new_paid_amount > 0 THEN
        v_new_status := 'PARTIAL';
    ELSE
        IF NOW() > v_charge_due_date THEN
            v_new_status := 'OVERDUE';
        ELSE
            v_new_status := 'PENDING';
        END IF;
    END IF;

    -- 5. Revertir saldo a favor si este pago generó excedente contable en HouseAccount
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

    -- 6. Actualizar MaintenanceCharge
    UPDATE "MaintenanceCharge"
    SET "paidAmount" = v_new_paid_amount,
        status = v_new_status::"MaintenanceChargeStatus",
        "updatedAt" = NOW()
    WHERE id = v_charge_id;

    -- 7. Eliminar el registro de Payment
    DELETE FROM "Payment" WHERE id = v_payment_id;

    RAISE NOTICE '✅ Cargo actualizado:';
    RAISE NOTICE '   - Monto pagado: $% -> $%', v_charge_paid_amount, v_new_paid_amount;
    RAISE NOTICE '   - Estatus:      % -> %', v_charge_status, v_new_status;
    IF v_excess_reverted > 0 THEN
        RAISE NOTICE '   - Saldo a favor revertido: -$%', v_excess_reverted;
    END IF;
    RAISE NOTICE '✅ Pago % eliminado de la base de datos.', v_payment_id;
    RAISE NOTICE '=============================================================';
END $$;
