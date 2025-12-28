import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { UserService, UserRole } from "../services/userService";

export function useUserRoles() {
  const { session } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isReviewer, setIsReviewer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRoles() {
      if (!session?.user) {
        setRoles([]);
        setIsAdmin(false);
        setIsModerator(false);
        setIsReviewer(false);
        setIsLoading(false);
        return;
      }

      try {
        const userRoles = await UserService.getUserRoles(session.user.id);
        setRoles(userRoles);
        setIsAdmin(userRoles.some(r => r.role === 'admin'));
        setIsModerator(userRoles.some(r => r.role === 'moderator' || r.role === 'admin'));
        setIsReviewer(userRoles.some(r => r.role === 'reviewer' || r.role === 'admin'));
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRoles([]);
        setIsAdmin(false);
        setIsModerator(false);
        setIsReviewer(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoles();
  }, [session?.user]);

  return {
    roles,
    isAdmin,
    isModerator,
    isReviewer,
    isLoading,
    hasRole: (role: 'user' | 'admin' | 'moderator' | 'reviewer') => roles.some(r => r.role === role)
  };
}