// app/services/authService.ts
import { createClient } from '@/utils/supabase/client';
import type { Session } from '@supabase/supabase-js';

export class AuthService {
  static async getCurrentUser() {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static onAuthStateChange(callback: (session: Session | null) => void) {
    const supabase = createClient();
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}