-- =================================================================
-- SIMULACIÓN: Ingesta de Lead desde "n8n" (Mock)
-- =================================================================
-- Este script simula lo que hará n8n automáticamente.
-- Úsalo para probar que tu base de datos y frontend responden bien.

-- 1. SETUP: Asegurar que existe un tenant con un Page ID configurado
-- (En producción esto ya estará configurado por el usuario en la UI)
DO $$
DECLARE
    my_tenant_id uuid;
BEGIN
    -- Vamos a usar el primer tenant que encontremos para la prueba
    SELECT id INTO my_tenant_id FROM public.tenants LIMIT 1;
    
    IF my_tenant_id IS NOT NULL THEN
        -- Asignamos un Fake Page ID para probar
        UPDATE public.tenants 
        SET meta_page_id = '1122334455' 
        WHERE id = my_tenant_id;
        
        RAISE NOTICE 'Tenant configurado para pruebas: %', my_tenant_id;
    ELSE
        RAISE EXCEPTION 'No hay tenants en la base de datos. Crea una empresa primero.';
    END IF;
END $$;

-- 2. SIMULAR INGESTA (Lo que hace n8n)
DO $$
DECLARE
    target_tenant_id uuid;
    incoming_page_id text := '1122334455'; -- El ID que viene de Meta
BEGIN
    -- Paso 1 de n8n: Buscar Tenant por Page ID
    SELECT id INTO target_tenant_id 
    FROM public.tenants 
    WHERE meta_page_id = incoming_page_id;

    IF target_tenant_id IS NULL THEN
        RAISE NOTICE 'Error: No se encontró tenant para la página %', incoming_page_id;
        RETURN;
    END IF;

    -- Paso 2 de n8n: Insertar Lead con Metadata
    INSERT INTO public.leads (
        name,
        email,
        phone,
        source,
        status,
        tenant_id,
        user_id, -- Null (sin asignar)
        metadata -- JSON Mágico
    ) VALUES (
        'Lead Simulado n8n',
        'simulacion@test.com',
        '+34600999888',
        'TikTok', -- Probamos que funcione el icono de TikTok
        'new',
        target_tenant_id,
        NULL,
        '{
            "campaign_name": "Campaña Prueba SQL",
            "ad_name": "Video Demo",
            "platform_data": { "test": true }
        }'::jsonb
    );

    RAISE NOTICE 'Lead insertado correctamente para el tenant %', target_tenant_id;
END $$;

-- 3. VERIFICACIÓN
SELECT id, name, source, metadata FROM public.leads WHERE email = 'simulacion@test.com';
