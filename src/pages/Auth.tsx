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

type SignupStep = "form" | "verify-otp";
type ForgotPasswordStep = "email" | "verify-otp" | "new-password";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Get redirect path from URL params or default to home
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get('redirect') || '/';

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Signup form state
  const [signupStep, setSignupStep] = useState<SignupStep>("form");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupOtp, setSignupOtp] = useState("");

  // Forgot password state
  const [forgotPasswordStep, setForgotPasswordStep] = useState<ForgotPasswordStep>("email");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) throw error;

      toast.success("Successfully logged in!");
      navigate(redirectTo);
    } catch (error: any) {
      toast.error(error.message || "Failed to login");
    } finally {
      setLoading(false);
    }
  };

  const handleSendSignupOtp = async (e: React.FormEvent) => {
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
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email: signupEmail, purpose: "signup" },
      });

      if (error) throw error;

      toast.success("OTP sent to your email!");
      setSignupStep("verify-otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signupOtp || signupOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const { error: verifyError } = await supabase.functions.invoke("verify-otp", {
        body: { email: signupEmail, otpCode: signupOtp, purpose: "signup" },
      });

      if (verifyError) throw verifyError;

      // Create account
      const redirectUrl = `${window.location.origin}/`;
      const { error: signupError } = await supabase.auth.signUp({
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

      if (signupError) throw signupError;

      toast.success("Account created successfully! You can now login.");
      
      // Reset form and stay on signup tab for user to login
      setSignupStep("form");
      setSignupName("");
      setSignupEmail("");
      setSignupPhone("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setSignupOtp("");
    } catch (error: any) {
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered. Please login instead.");
      } else {
        toast.error(error.message || "Failed to verify OTP or create account");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { email: resetEmail, purpose: "reset_password" },
      });

      if (error) throw error;

      toast.success("OTP sent to your email!");
      setForgotPasswordStep("verify-otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetOtp || resetOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke("verify-otp", {
        body: { email: resetEmail, otpCode: resetOtp, purpose: "reset_password" },
      });

      if (error) throw error;

      toast.success("OTP verified! Please enter your new password.");
      setForgotPasswordStep("new-password");
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmNewPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: redirectUrl,
      });

      if (resetError) throw resetError;

      toast.success("Password reset link sent to your email! Please check your inbox.");
      
      // Reset form
      setShowForgotPassword(false);
      setForgotPasswordStep("email");
      setResetEmail("");
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
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
              {!showForgotPassword ? (
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Signup</TabsTrigger>
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
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="w-full text-sm text-primary hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup">
                    {signupStep === "form" ? (
                      <form onSubmit={handleSendSignupOtp} className="space-y-4">
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
                          {loading ? "Sending OTP..." : "Send OTP"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifySignupOtp} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-otp">Enter OTP</Label>
                          <Input
                            id="signup-otp"
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={signupOtp}
                            onChange={(e) => setSignupOtp(e.target.value)}
                            disabled={loading}
                            maxLength={6}
                            required
                          />
                          <p className="text-sm text-muted-foreground">
                            We've sent a 6-digit code to {signupEmail}
                          </p>
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                          {loading ? "Verifying..." : "Verify & Create Account"}
                        </Button>
                        <button
                          type="button"
                          onClick={() => setSignupStep("form")}
                          className="w-full text-sm text-muted-foreground hover:text-foreground"
                          disabled={loading}
                        >
                          Back to form
                        </button>
                      </form>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotPasswordStep("email");
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    disabled={loading}
                  >
                    ← Back to Login
                  </button>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Reset Password</h3>
                    <p className="text-sm text-muted-foreground">
                      {forgotPasswordStep === "email" && "Enter your email to receive an OTP"}
                      {forgotPasswordStep === "verify-otp" && "Enter the OTP sent to your email"}
                      {forgotPasswordStep === "new-password" && "Enter your new password"}
                    </p>
                  </div>

                  {forgotPasswordStep === "email" && (
                    <form onSubmit={handleSendResetOtp} className="space-y-4">
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
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Sending OTP..." : "Send OTP"}
                      </Button>
                    </form>
                  )}

                  {forgotPasswordStep === "verify-otp" && (
                    <form onSubmit={handleVerifyResetOtp} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reset-otp">Enter OTP</Label>
                        <Input
                          id="reset-otp"
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={resetOtp}
                          onChange={(e) => setResetOtp(e.target.value)}
                          disabled={loading}
                          maxLength={6}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          We've sent a 6-digit code to {resetEmail}
                        </p>
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Verifying..." : "Verify OTP"}
                      </Button>
                    </form>
                  )}

                  {forgotPasswordStep === "new-password" && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="••••••••"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                        <Input
                          id="confirm-new-password"
                          type="password"
                          placeholder="••••••••"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          disabled={loading}
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Resetting..." : "Reset Password"}
                      </Button>
                    </form>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Auth;
