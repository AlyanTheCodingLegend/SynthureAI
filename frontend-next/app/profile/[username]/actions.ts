"use server";

import supabase from "@/app/_components/ClientInstance";

const supabaseUrl = process.env.SUPABASE_URL

export const signOutServer = async () => {
    const response = await supabase.auth.signOut()
    return response
}

export const deleteUserFolders = async (username: string) => {
    try {
      const { data: list, error: listError } = await supabase.storage.from('songs').list(`${username}`);
      if (listError) throw listError
      const filesToRemove = list.map((x) => `${username}/${x.name}`);

      const { error: deleteError } = await supabase.storage.from('songs').remove(filesToRemove);
      if (deleteError) throw deleteError

      const { data: listTwo, error: listTwoError } = await supabase.storage.from('images').list(`${username}`);
      if (listTwoError) throw listTwoError
      const filesToRemoveTwo = listTwo.map((y) => `${username}/${y.name}`);

      const { error: deleteTwoError } = await supabase.storage.from('images').remove(filesToRemoveTwo);
      if (deleteTwoError) throw deleteTwoError

      return null
    } catch (error: unknown) {
      if (error instanceof Error) {
        return error
      }
    }  
}

export const handleSubmit = async (username: string, pfp: File[]) => {
    const {error} = await supabase.storage.from('images').upload(`${username}/pfp.${pfp[0]?.type.replace('image/', '')}`, pfp[0], { cacheControl: '60', upsert: true, contentType: pfp[0] ? pfp[0].type: "image/jpeg"})
    if (error) {
      return error
    } else {
      const {error: errorOne} = await supabase.from('user_information').update({pfp_path: `${supabaseUrl}/storage/v1/object/public/images/${username}/pfp.${pfp[0]?.type.replace('image/','')}`}).eq('username', username)
      if (errorOne) {
        return errorOne
      } else {
        toast.success('Profile Photo successfully updated!', toast_style)
        window.location.reload();
      }
    }
}

export const getUserInfoServer = async (username: string) => {
    const response = await supabase
        .from('user_information')
        .select('userid, hashpass')
        .eq('username', username);

    return response
}

export const deleteUserServer = async (userID: string) => {
    const response = await supabase.auth.admin.deleteUser(userID);

    return response
}