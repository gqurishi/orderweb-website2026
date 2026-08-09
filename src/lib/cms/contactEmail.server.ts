/** Clean contact-form email template for the OrderWeb inbox. */

export type ContactEnquiry = {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  message: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function row(label: string, value: string) {
  const safe = escapeHtml(value || "—");
  return `
    <tr>
      <td style="padding:14px 0;border-bottom:1px solid #e4eef7;vertical-align:top;width:140px;">
        <p style="margin:0;font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#2f6fb8;font-weight:600;">
          ${escapeHtml(label)}
        </p>
      </td>
      <td style="padding:14px 0;border-bottom:1px solid #e4eef7;vertical-align:top;">
        <p style="margin:0;font-size:16px;line-height:1.55;color:#0a1a4a;font-weight:500;">
          ${safe}
        </p>
      </td>
    </tr>`;
}

export function buildContactEnquiryEmail(data: ContactEnquiry) {
  const name = data.name.trim();
  const email = data.email.trim();
  const company = (data.company || "").trim() || "—";
  const phone = (data.phone || "").trim() || "—";
  const message = data.message.trim();
  const when = new Date().toLocaleString("en-GB", {
    timeZone: "Europe/London",
    dateStyle: "medium",
    timeStyle: "short",
  });

  const subject = `New website enquiry — ${name}`;

  const text = [
    "New website enquiry",
    "────────────────────────",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    `Company: ${company}`,
    "────────────────────────",
    "Message",
    message,
    "────────────────────────",
    `Received: ${when} (UK)`,
    "Reply to this email to respond to the sender.",
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#eef4f9;font-family:Arial,Helvetica,sans-serif;color:#0a1a4a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef4f9;padding:28px 14px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:640px;background:#ffffff;border:1px solid #d7e7f4;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:22px 28px;background:linear-gradient(145deg,#abeafd 0%,#61c3ec 28%,#2f6fb8 62%,#0a1a4a 100%);">
              <p style="margin:0;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.85);font-weight:600;">
                OrderWeb website
              </p>
              <h1 style="margin:8px 0 0;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;">
                New contact enquiry
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 6px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                ${row("Name", name)}
                ${row("Email", email)}
                ${row("Phone", phone)}
                ${row("Company", company)}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 26px;">
              <p style="margin:0 0 10px;font-size:12px;line-height:1.4;letter-spacing:0.08em;text-transform:uppercase;color:#2f6fb8;font-weight:600;">
                Message
              </p>
              <div style="padding:16px 18px;border:1px solid #e4eef7;border-radius:12px;background:#f8fbfd;">
                <p style="margin:0;font-size:16px;line-height:1.65;color:#0a1a4a;white-space:pre-wrap;">
                  ${escapeHtml(message)}
                </p>
              </div>
              <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#5b6b7c;">
                Received ${escapeHtml(when)} (UK). Reply to this email to contact ${escapeHtml(name)}.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html };
}
