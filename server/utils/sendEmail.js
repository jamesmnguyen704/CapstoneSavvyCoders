// Lightweight sendEmail helper used by signup, password reset, etc.
// Dynamically imports Resend to avoid import-time errors on older Node
// environments that may not have global fetch/Headers.
export async function sendEmail({ to, subject, html, from = process.env.EMAIL_FROM }) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("⚠️ WARNING: RESEND_API_KEY missing — skipping email send");
    return null;
  }

  // Normalize recipients to an array so callers can pass a single address or many
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to].filter(Boolean);
  if (!recipients.length) {
    console.warn("[sendEmail] No recipient provided — skipping send");
    return null;
  }

  const results = [];

  try {
    const { Resend } = await import("resend");
    const client = new Resend(process.env.RESEND_API_KEY);

    // Send sequentially to avoid flooding rate limits during demos
    for (const recipient of recipients) {
      try {
        const resp = await client.emails.send({ from, to: recipient, subject, html });
        // Log a concise success message to help diagnose delivery issues
        try {
          const short = typeof resp === "object" ? JSON.stringify(resp).slice(0, 800) : String(resp);
          console.log(`[sendEmail] Sent to=${recipient} time=${new Date().toISOString()} resp=${short}`);
        } catch (logErr) {
          console.log("[sendEmail] Sent (resp log failed)", recipient);
        }
        results.push({ to: recipient, ok: true, resp });
      } catch (sendErr) {
        // Detect common Resend validation error to give actionable guidance
        const msg = sendErr && sendErr.message ? sendErr.message : String(sendErr);
        if (msg.includes("validation_error") || (sendErr?.response && sendErr.response.status === 403)) {
          console.error(
            `[sendEmail] Validation/403 error sending to=${recipient}: ${msg}.` +
              " Verify your sending domain in Resend or use the onboarding address."
          );
        } else {
          console.error(`[sendEmail] Error sending to=${recipient}:`, msg);
        }
        results.push({ to: recipient, ok: false, error: msg });
      }
    }

    return results.length === 1 ? results[0] : results;
  } catch (err) {
    console.error("sendEmail error:", err && err.message ? err.message : err);
    throw err;
  }
}
