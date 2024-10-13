"use server";

import supabase from "../_components/ClientInstance";

export const signUpServer = async (email: string, pass: string) => {
    const response = await supabase.auth.signUp({
        email: email,
        password: pass,
    });

    return response;
}

export const addUserToDB = async (userid: string, email: string, hash: string, username: string) => {
    const response = await supabase.from("user_information").insert({
        userid: userid,
        email: email,
        hashpass: hash,
        username: username,
    });

    return response;
}