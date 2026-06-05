import { supabase } from './supabase';

export async function seedHomeOrg(userId) {
  if (!userId) return { error: 'Missing userId' };
  const { error } = await supabase.rpc('seed_home_org_for_user', { p_user_id: userId });
  return { error };
}
