import type { Context } from "@netlify/functions";

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

  const sendgridKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "noreply@example.com";

  if (!sendgridKey) {
    console.warn("SENDGRID_API_KEY not configured — email not sent");
    return new Response(
      JSON.stringify({ sent: false, reason: "Email service not configured" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #5A2E88, #E91E8C); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">Your Edit Token</h1>
      </div>
      <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p style="color: #374151; font-size: 16px;">Your event <strong>${eventName}</strong> has been submitted successfully.</p>
        <p style="color: #374151; font-size: 16px;">Save this edit token — you'll need it to make changes to your event:</p>
        <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; text-align: center; margin: 20px 0;">
          <code style="font-size: 20px; color: #5A2E88; letter-spacing: 2px; font-weight: bold;">${editToken}</code>
        </div>
        <p style="color: #6b7280; font-size: 14px;">Keep this token safe. You will need it to edit or delete your event listing.</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email }] }],
        from: { email: fromEmail },
        subject: `Your edit token for "${eventName}"`,
        content: [
          { type: "text/html", value: htmlBody },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid error:", errorText);
      return new Response(
        JSON.stringify({ sent: false, reason: "Failed to send email" }),
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
