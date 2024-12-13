import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export function AuthDialog() {
  const { showAuthDialog, setShowAuthDialog } = useAuth();
  return (
    <div className="animate-in fade-in duration-500">
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log in</DialogTitle>
            <DialogDescription>
              Create an account or log in to save your progress and track your
              learning journey.
            </DialogDescription>
          </DialogHeader>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            theme="light"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
