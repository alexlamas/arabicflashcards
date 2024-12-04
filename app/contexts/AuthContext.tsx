import { createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  refreshSession: async () => {},
});

export const useAuth = () => useContext(AuthContext);
