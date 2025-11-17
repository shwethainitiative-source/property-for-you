import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Forgot password state
  const [resetEmail, setResetEmail] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast.success("Successfully logged in!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupName || !signupEmail || !signupPhone || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(signupPhone.replace(/\s/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: signupName,
            phone: signupPhone,
          },
        },
      });

      if (error) throw error;

      toast.success("Account created successfully! You can now login.");
      // Clear form
      setSignupName("");
      setSignupEmail("");
      setSignupPhone("");
      setSignupPassword("");
      setSignupConfirmPassword("");
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.error(error.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast.success("Password reset link sent! Check your email.");
      setResetEmail("");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome to ThePropertyForYou</CardTitle>
              <CardDescription>Login or create an account to post ads</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Signup</TabsTrigger>
                  <TabsTrigger value="reset">Reset</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        placeholder="9876543210"
                        value={signupPhone}
                        onChange={(e) => setSignupPhone(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="reset">
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a password reset link to your email.
                    </p>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
