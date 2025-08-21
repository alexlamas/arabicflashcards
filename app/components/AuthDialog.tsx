import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Auth } from "@supabase/auth-ui-react";
import { useAuth } from "../contexts/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { BookOpen, Brain, TrendingUp, Globe } from "lucide-react";

export function AuthDialog() {
  const { showAuthDialog, setShowAuthDialog } = useAuth();
  const supabase = createClient();
  
  return (
    <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
      <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden">
        <div className="grid sm:grid-cols-2">
          {/* Left side - Features */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white hidden sm:flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Start Your Journey
              </h2>
              <p className="text-blue-100 mb-8">
                Join thousands learning Lebanese Arabic with our scientifically-proven spaced repetition method.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Smart Learning</h3>
                    <p className="text-sm text-blue-100">
                      Reviews scheduled at scientifically optimal intervals for maximum retention
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Detailed Analytics</h3>
                    <p className="text-sm text-blue-100">
                      Track your progress with comprehensive statistics and learning insights
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Offline Support</h3>
                    <p className="text-sm text-blue-100">
                      Continue learning anywhere, with automatic sync when reconnected
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/20">
              <div className="flex items-center gap-2 text-sm text-blue-100">
                <BookOpen className="h-4 w-4" />
                <span>Free forever • No credit card required</span>
              </div>
            </div>
          </div>
          
          {/* Right side - Auth form */}
          <div className="p-8">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome
              </h3>
              <p className="text-gray-600">
                Sign in to continue learning, or create an account to get started
              </p>
            </div>
            
            <Auth
              supabaseClient={supabase}
              appearance={{ 
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#2563eb',
                      brandAccent: '#1d4ed8',
                      brandButtonText: 'white',
                      defaultButtonBackground: 'white',
                      defaultButtonBackgroundHover: '#f9fafb',
                      inputBackground: 'white',
                      inputBorder: '#e5e7eb',
                      inputBorderHover: '#d1d5db',
                      inputBorderFocus: '#2563eb',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '0.5rem',
                      buttonBorderRadius: '0.5rem',
                      inputBorderRadius: '0.5rem',
                    },
                  }
                },
                className: {
                  container: 'space-y-4',
                  button: 'font-medium',
                  input: 'font-normal',
                }
              }}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email address',
                    password_label: 'Password',
                    button_label: 'Sign in',
                    loading_button_label: 'Signing in...',
                    link_text: "Don't have an account? Sign up",
                  },
                  sign_up: {
                    email_label: 'Email address',
                    password_label: 'Create a password',
                    button_label: 'Create account',
                    loading_button_label: 'Creating account...',
                    link_text: 'Already have an account? Sign in',
                  },
                },
              }}
              providers={[]}
              theme="light"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
