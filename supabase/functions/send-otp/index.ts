import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";



const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendOTPRequest {
  email: string;
  purpose: "signup" | "reset_password";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, purpose }: SendOTPRequest = await req.json();

    if (!email || !purpose) {
      return new Response(JSON.stringify({ error: "Email and purpose are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up old OTPs for this email and purpose
    await supabase.from("otp_codes").delete().eq("email", email).eq("purpose", purpose);

    // Store OTP in database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from("otp_codes").insert({
      email,
      otp_code: otpCode,
      purpose,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      throw new Error("Failed to store OTP");
    }

    // Send email with OTP
    const subject =
      purpose === "signup" ? "Verify Your Email - ThePropertyForYou2" : "Reset Your Password - Thepropertyforyou2025";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">ThePropertyForYou</h1>
        <h2>${purpose === "signup" ? "Welcome!" : "Password Reset"}</h2>
        <p>Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
          ${otpCode}
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    // Initialize SMTP client with Gmail
    const gmailUser = Deno.env.get("GMAIL_USER");
    const gmailPassword = Deno.env.get("GMAIL_APP_PASSWORD");

    if (!gmailUser || !gmailPassword) {
      console.error("Gmail credentials not configured");
      throw new Error("Email service not configured properly");
    }

    const smtpClient = new SMTPClient({
      connection: {
        hostname: "smtp.gmail.com",
        port: 587,
        tls: true,
        auth: {
          username: gmailUser,
          password: gmailPassword,
        },
      },
    });

    try {
      console.log("Attempting to send OTP email to:", email);
      
      await smtpClient.send({
        from: gmailUser,
        to: email,
        subject,
        html,
      });

      console.log("OTP email sent successfully to:", email);
      await smtpClient.close();
    } catch (emailError: any) {
      console.error("Nodemailer/Gmail SMTP error details:", {
        message: emailError.message,
        code: emailError.code,
        command: emailError.command,
        response: emailError.response,
        stack: emailError.stack,
      });
      
      // Delete the OTP since email failed
      await supabase.from("otp_codes").delete().eq("email", email).eq("otp_code", otpCode);
      
      // Close connection on error
      try {
        await smtpClient.close();
      } catch (closeError) {
        console.error("Error closing SMTP connection:", closeError);
      }

      throw new Error(`Failed to send email via Gmail SMTP: ${emailError.message || emailError}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "OTP sent successfully",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      },
    );
  } catch (error: any) {
    console.error("Error in send-otp function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
