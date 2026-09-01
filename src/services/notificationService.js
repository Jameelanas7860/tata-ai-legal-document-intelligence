// Notifications service — real Supabase database queries.

import { supabase } from '../lib/supabase';

export default {
  async getNotifications() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw new Error(error.message);
    return data.map((n) => ({
      id: n.id,
      title: n.title,
      detail: n.detail,
      time: n.time_label || 'Recently',
      unread: !n.is_read,
    }));
  },

  async markAsRead(id) {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },
};
