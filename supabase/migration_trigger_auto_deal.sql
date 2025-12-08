-- Function to automatically create a deal when a lead is inserted
CREATE OR REPLACE FUNCTION create_deal_from_lead()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO deals (
        tenant_id,
        title,
        value,
        stage,
        lead_id,
        contact_id, -- Optional: link to same contact if needed, or leave null as lead_id is the link
        active
    )
    VALUES (
        NEW.tenant_id,
        -- Use Company Name if available, else Lead Name, else default
        COALESCE(NEW.company, NEW.name, 'Nuevo Lead'),
        -- Use Lead Value if available, else 0
        COALESCE(NEW.value, 0),
        'qualification', -- Default stage
        NEW.id,
        NULL, -- contact_id (optional, logic can be added if leads are linked to profiles)
        true
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to fire after a new lead is inserted
DROP TRIGGER IF EXISTS on_lead_created ON leads;
CREATE TRIGGER on_lead_created
AFTER INSERT ON leads
FOR EACH ROW
EXECUTE FUNCTION create_deal_from_lead();
