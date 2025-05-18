DECLARE
    result_record JSONB;
BEGIN
    -- Insert the song information into song_information table
    INSERT INTO public.song_information (
        artist_name,
        image_path,
        "is_AI_gen",
        song_name,
        song_path,
        uploaded_by,
        "is_YT_fetched",
        created_at
    )
    VALUES (
        p_artist_name,
        p_image_path,
        TRUE,  -- is_AI_gen is always true for transformed songs
        p_song_name,
        p_song_path,
        p_username,
        FALSE, -- is_YT_fetched is false since this is AI generated
        NOW()  -- current timestamp
    )
    RETURNING to_jsonb(song_information.*) INTO result_record;

    -- Return the inserted record as JSONB
    RETURN result_record;
EXCEPTION
    WHEN OTHERS THEN
        RETURN jsonb_build_object(
            'error', SQLERRM,
            'error_code', SQLSTATE
        );
END;