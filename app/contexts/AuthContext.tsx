import { createContext, useContext } from "react";
import { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
  showAuthDialog: boolean;
  handleLogout: () => Promise<void>;
  setShowAuthDialog: (value: boolean) => void;
};

export const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true,
  refreshSession: async () => {},
  showAuthDialog: false,
  handleLogout: async () => {},
  setShowAuthDialog: () => {},
});

export const useAuth = () => useContext(AuthContext);
