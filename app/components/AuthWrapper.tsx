// app/components/AuthWrapper.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { Session } from "@supabase/supabase-js";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={["google"]}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <header className="p-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-semibold">Lebanese Arabic</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Log out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
