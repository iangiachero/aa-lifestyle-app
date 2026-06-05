import { supabase } from './supabase';

export async function seedChecklists(userId) {
  if (!userId) return { error: 'Missing userId' };
  const { error } = await supabase.rpc('seed_checklists_for_user', { p_user_id: userId });
  return { error };
}
