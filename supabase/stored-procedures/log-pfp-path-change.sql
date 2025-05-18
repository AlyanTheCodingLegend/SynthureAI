BEGIN
    -- Only log if the pfp_path has actually changed
    IF OLD.pfp_path IS DISTINCT FROM NEW.pfp_path THEN
        INSERT INTO audit_information (
            updated_at,
            user_id
        ) VALUES (
            CURRENT_TIMESTAMP,
            NEW.userid  -- Using userid as shown in the schema
        );
    END IF;
    
    RETURN NEW;
END;
