import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.81.1";



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
<<<<<<< HEAD
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return new Response(JSON.stringify({ error: "Internal server configuration error" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Starting OTP process for ${email} (${purpose})`);

    // Clean up old OTPs for this email and purpose
    try {
      const { error: deleteError } = await supabase
        .from("otp_codes")
        .delete()
        .eq("email", email)
        .eq("purpose", purpose);
      
      if (deleteError) {
        console.warn("Non-critical error deleting old OTPs:", deleteError);
      }
    } catch (e) {
      console.warn("Exception during OTP cleanup:", e);
    }
=======
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean up old OTPs for this email and purpose
    await supabase.from("otp_codes").delete().eq("email", email).eq("purpose", purpose);
>>>>>>> b92835de31a0a492b67041dfc5fe45978d9f78b8

    // Store OTP in database (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase.from("otp_codes").insert({
      email,
      otp_code: otpCode,
      purpose,
      expires_at: expiresAt,
    });

    if (insertError) {
<<<<<<< HEAD
      console.error("Error storing OTP in database:", insertError);
      return new Response(JSON.stringify({ 
        error: "Failed to generate OTP code. Please ensure database is configured correctly.",
        details: insertError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
=======
      console.error("Error storing OTP:", insertError);
      throw new Error("Failed to store OTP");
>>>>>>> b92835de31a0a492b67041dfc5fe45978d9f78b8
    }

    // Send email with OTP
    const subject =
<<<<<<< HEAD
      purpose === "signup" ? "Verify Your Email - ThePropertyForYou" : "Reset Your Password - ThePropertyForYou";

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; padding: 20px; border-radius: 8px;">
        <h1 style="color: #3b82f6; text-align: center;">ThePropertyForYou</h1>
        <h2 style="text-align: center;">${purpose === "signup" ? "Welcome!" : "Password Reset"}</h2>
        <p style="text-align: center; font-size: 16px; color: #4b5563;">Your verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 4px; color: #1f2937;">
          ${otpCode}
        </div>
        <p style="text-align: center; font-size: 14px; color: #6b7280;">This code will expire in 10 minutes.</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="text-align: center; font-size: 12px; color: #9ca3af;">If you didn't request this code, please ignore this email.</p>
      </div>
    `;

    // Send email using Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured in Supabase secrets");
      return new Response(JSON.stringify({ 
        error: "Email service not configured. Please set RESEND_API_KEY in Supabase secrets." 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    try {
      console.log(`Attempting to send email via Resend to ${email}`);
=======
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

    // Send email using Resend (more reliable than Gmail SMTP in edge functions)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      throw new Error("Email service not configured");
    }

    try {
      console.log("Sending OTP email to:", email);
>>>>>>> b92835de31a0a492b67041dfc5fe45978d9f78b8
      
      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "ThePropertyForYou <thepropertyforyou4@gmail.com>",
          to: [email],
          subject,
          html,
        }),
      });

      const emailData = await emailResponse.json();

      if (!emailResponse.ok) {
<<<<<<< HEAD
        console.error("Resend API error response:", emailData);
        return new Response(JSON.stringify({ 
          error: "Failed to send email via service provider.",
          details: emailData.message || "Unknown provider error"
        }), {
          status: emailResponse.status,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
=======
        console.error("Resend API error:", emailData);
        throw new Error(emailData.message || "Failed to send email");
>>>>>>> b92835de31a0a492b67041dfc5fe45978d9f78b8
      }

      console.log("OTP email sent successfully:", emailData.id);
    } catch (emailError: any) {
<<<<<<< HEAD
      console.error("Network or internal error sending email:", emailError);
=======
      console.error("Email sending error:", emailError);
>>>>>>> b92835de31a0a492b67041dfc5fe45978d9f78b8
      
      // Delete the OTP since email failed
      await supabase.from("otp_codes").delete().eq("email", email).eq("otp_code", otpCode);
      
<<<<<<< HEAD
      return new Response(JSON.stringify({ 
        error: "Failed to connect to email service.",
        details: emailError.message 
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
=======
      throw new Error(`Failed to send email: ${emailError.message || emailError}`);
>>>>>>> b92835de31a0a492b67041dfc5fe45978d9f78b8
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
<<<<<<< HEAD
    console.error("Unexpected error in send-otp function:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred", details: error.message }), {
=======
    console.error("Error in send-otp function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
>>>>>>> b92835de31a0a492b67041dfc5fe45978d9f78b8
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
