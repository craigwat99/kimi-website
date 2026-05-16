import type { Context } from "@netlify/functions";
import { Resend } from "resend";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, eventName, editToken } = await req.json();

  if (!email || !eventName || !editToken) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!resendKey) {
    console.warn("RESEND_API_KEY not configured — email not sent");
    return new Response(
      JSON.stringify({ sent: false, reason: "Email service not configured" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!fromEmail) {
    console.warn("EMAIL_FROM not configured — email not sent. Set the EMAIL_FROM environment variable to a verified Resend sender email.");
    return new Response(
      JSON.stringify({ sent: false, reason: "Sender email not configured" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #784982; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Event Submission Confirmation</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">Your event <strong>${eventName}</strong> has been submitted successfully!</p>
        <p style="color: #374151; font-size: 16px;">Your event will be reviewed and published once approved.</p>
        <p style="color: #374151; font-size: 16px;">Save this edit token — you'll need it to make changes to your event:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <code style="font-size: 20px; color: #5A2E88; letter-spacing: 2px; font-weight: bold;">${editToken}</code>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Keep this token safe. You will need it to edit your event listing.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">This is an automated message from 40 Years — Homosexual Law Reform event listings.</p>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: `40 Years HLR Events <${fromEmail}>`,
      to: [email],
      subject: `Event Confirmation: ${eventName} — Your Edit Token`,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend error:", error);

      let reason = "Failed to send email";
      if (error.name === "validation_error") {
        reason = "Sender email not verified in Resend. Please verify the EMAIL_FROM address in your Resend account.";
      }

      return new Response(
        JSON.stringify({ sent: false, reason }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ sent: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return new Response(
      JSON.stringify({ sent: false, reason: "Failed to send email" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};
