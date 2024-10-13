"use server";

import supabase from "../_components/ClientInstance";

export const signInServer = async (email: string, pass: string) => {
    const response = await supabase.auth.signInWithPassword({
        email: email,
        password: pass
    })

    return response
}