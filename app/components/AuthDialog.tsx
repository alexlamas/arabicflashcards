import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAuth } from "../contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthDialog() {
  const { showAuthDialog, setShowAuthDialog } = useAuth();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"email" | "password">("email");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Try to sign up first to check if user exists
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-8), // Random password
      });

      // Check if user already exists using the identities array
      if (data?.user?.identities?.length === 0) {
        // User already exists - proceed to sign in
        setIsNewUser(false);
        setStep("password");
      } else if (data?.user) {
        // New user was created - we need to clean up and let them set password
        // Note: This creates a user with a random password that will be updated
        setIsNewUser(true);
        setStep("password");
      } else if (signUpError) {
        // Handle other errors
        setError(signUpError.message);
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isNewUser) {
        // Sign up new user
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
        } else {
          // Success - the auth context will handle the redirect
          setShowAuthDialog(false);
        }
      } else {
        // Sign in existing user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          setError(signInError.message);
        } else {
          // Success - the auth context will handle the redirect
          setShowAuthDialog(false);
        }
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setPassword("");
    setError(null);
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }
      );

      if (resetError) {
        setError(resetError.message);
      } else {
        setError("Check your email for a password reset link.");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden bg-transparent border-0">
        <div>
          {/* Auth form */}
          <div className="p-8 bg-white h-full flex flex-col rounded-lg">
            <div className="mb-6">
              <h3 className="text-2xl font-pphatton font-bold text-gray-900 mb-2">
                Welcome
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sign in to continue learning, or create an account to get
                started.
              </p>
            </div>

            {step === "email" ? (
              <form
                onSubmit={handleEmailSubmit}
                className="flex flex-col justify-between h-full gap-8"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="e.g. habibi123@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="py-6 px-4 shadow-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900/20 focus:ring-offset-white focus:border-gray-900"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                  type="submit"
                  className="w-full rounded-full h-12 text-sm font-medium bg-gray-900 hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handlePasswordSubmit}
                className="h-full flex flex-col justify-between gap-8"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">{email}</p>
                    <button
                      type="button"
                      onClick={handleChangeEmail}
                      className="text-sm text-gray-500 hover:text-gray-900 transition"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      {isNewUser ? "Create a password" : "Enter your password"}
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={
                        isNewUser
                          ? "Choose a secure password"
                          : "Enter your password"
                      }
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoFocus
                      minLength={6}
                      className="py-6 px-4 shadow-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900/20 focus:ring-offset-white focus:border-gray-900"
                    />
                    {isNewUser && (
                      <p className="text-xs text-gray-500">
                        Must be at least 6 characters
                      </p>
                    )}
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                  type="submit"
                  className="w-full rounded-full h-12 text-sm font-medium bg-gray-900 hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isNewUser ? (
                    "Create account"
                  ) : (
                    "Sign in"
                  )}
                </Button>

                {!isNewUser && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="w-full text-sm text-gray-600 hover:text-gray-900"
                  >
                    Forgot password?
                  </button>
                )}
              </form>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
