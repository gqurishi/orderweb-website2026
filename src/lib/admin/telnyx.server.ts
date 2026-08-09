/** Telnyx Messaging API helper (SMS MFA backup). */

export function telnyxConfigured() {
  return Boolean(
    (process.env["TELNYX_API_KEY"] ?? "").trim() &&
      (process.env["TELNYX_FROM_NUMBER"] ?? "").trim(),
  );
}

export async function sendTelnyxSms(input: { to: string; text: string }) {
  const apiKey = (process.env["TELNYX_API_KEY"] ?? "").trim();
  const from = (process.env["TELNYX_FROM_NUMBER"] ?? "").trim();
  if (!apiKey || !from) {
    return {
      ok: false as const,
      error: "SMS is not configured. Set TELNYX_API_KEY and TELNYX_FROM_NUMBER on the server.",
    };
  }

  const res = await fetch("https://api.telnyx.com/v2/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      text: input.text,
      type: "SMS",
    }),
  });

  if (!res.ok) {
    let detail = `Telnyx error (${res.status})`;
    try {
      const body = (await res.json()) as {
        errors?: Array<{ detail?: string; title?: string }>;
      };
      const first = body.errors?.[0];
      if (first?.detail || first?.title) {
        detail = first.detail || first.title || detail;
      }
    } catch {
      // ignore parse errors
    }
    return { ok: false as const, error: detail };
  }

  return { ok: true as const };
}
