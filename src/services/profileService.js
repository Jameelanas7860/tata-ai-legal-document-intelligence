// Profile service — real Supabase database queries.

import { supabase } from '../lib/supabase';
import authService from './authService';

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default {
  async getProfile() {
    const user = authService.getSessionUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw new Error(error.message);

    return {
      id: user.id,
      email: user.email,
      name: profile?.full_name || user.name || 'User',
      role: profile?.role || user.role || 'Legal Counsel',
      initials: getInitials(profile?.full_name || user.name || 'User'),
      organization: profile?.organization || user.organization || 'Tata Group',
      memberSince: profile?.member_since || user.memberSince || '',
    };
  },

  async updateProfile(updates) {
    const user = authService.getSessionUser();
    if (!user) throw new Error('Not authenticated');

    const dbUpdates = {};
    if (updates.name) dbUpdates.full_name = updates.name;
    if (updates.role) dbUpdates.role = updates.role;

    // Try to update existing profile, or insert if not found
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let data;
    if (existing) {
      const { data: updated, error } = await supabase
        .from('user_profiles')
        .update(dbUpdates)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      data = updated;
    } else {
      const { data: inserted, error } = await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          full_name: updates.name || user.name || '',
          role: updates.role || user.role || 'Legal Counsel',
          organization: user.organization || 'Tata Group',
          member_since: user.memberSince || '',
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      data = inserted;
    }

    return {
      name: data.full_name,
      role: data.role,
      organization: data.organization,
      memberSince: data.member_since,
    };
  },
};
