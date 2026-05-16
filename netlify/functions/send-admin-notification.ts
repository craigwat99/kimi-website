import type { Context } from "@netlify/functions";
import { Resend } from "resend";

const ADMIN_EMAIL = "craig@rainbowwellington.org.nz";

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { type, name, submitterEmail, details } = await req.json();

  if (!type || !name) {
    return new Response(
      JSON.stringify({ error: "Missing required fields" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!resendKey) {
    console.warn("RESEND_API_KEY not configured — admin notification not sent");
    return new Response(
      JSON.stringify({ sent: false, reason: "Email service not configured" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!fromEmail) {
    console.warn("EMAIL_FROM not configured — admin notification not sent");
    return new Response(
      JSON.stringify({ sent: false, reason: "Sender email not configured" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const isEvent = type === "event";
  const heading = isEvent ? "New Event Submission" : "New Love Letter Submission";
  const subject = isEvent
    ? `New Event Submitted: ${name}`
    : `New Love Letter from ${name}`;

  const detailRows = details
    ? Object.entries(details)
        .filter(([, value]) => value)
        .map(
          ([key, value]) =>
            `<tr><td style="padding: 8px 12px; color: #6b7280; font-size: 14px; white-space: nowrap; vertical-align: top;">${key}</td><td style="padding: 8px 12px; color: #374151; font-size: 14px;">${value}</td></tr>`
        )
        .join("")
    : "";

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #784982; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">${heading}</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">A new ${isEvent ? "event" : "love letter"} has been submitted and is awaiting review.</p>
        ${detailRows ? `<table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f9fafb; border-radius: 8px; overflow: hidden;">${detailRows}</table>` : ""}
        ${submitterEmail ? `<p style="color: #6b7280; font-size: 14px;">Submitter email: <a href="mailto:${submitterEmail}" style="color: #5A2E88;">${submitterEmail}</a></p>` : ""}
        <p style="color: #374151; font-size: 16px;">Log in to the <strong>Admin Dashboard</strong> to review and approve this submission.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #9ca3af; font-size: 12px;">This is an automated notification from 40 Years — Homosexual Law Reform.</p>
      </div>
    </div>
  `;

  try {
    const resend = new Resend(resendKey);

    const { error } = await resend.emails.send({
      from: `40 Years HLR Notifications <${fromEmail}>`,
      to: [ADMIN_EMAIL],
      subject,
      html: htmlBody,
    });

    if (error) {
      console.error("Resend error:", error);
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
    console.error("Admin notification error:", error);
    return new Response(
      JSON.stringify({ sent: false, reason: "Failed to send notification" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
};
