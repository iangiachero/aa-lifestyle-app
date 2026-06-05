import { supabase } from './supabase';

export async function seedLifestyleRoutines(userId, gender) {
  if (!userId || !gender) return { error: 'Missing userId or gender' };

  const normalizedGender = gender.toLowerCase();
  if (normalizedGender !== 'female' && normalizedGender !== 'male') {
    return { error: 'Gender must be female or male' };
  }

  const { error } = await supabase.rpc('seed_lifestyle_for_user', {
    p_user_id: userId,
    p_gender: normalizedGender,
  });

  return { error };
}

export async function resetAndReseedLifestyle(userId, gender) {
  if (!userId || !gender) return { error: 'Missing userId or gender' };

  const normalizedGender = gender.toLowerCase();
  if (normalizedGender !== 'female' && normalizedGender !== 'male') {
    return { error: 'Gender must be female or male' };
  }

  const { error } = await supabase.rpc('reset_lifestyle_for_user', {
    p_user_id: userId,
    p_gender: normalizedGender,
  });

  return { error };
}
