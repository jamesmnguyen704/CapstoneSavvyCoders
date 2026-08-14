import dotenv from "dotenv";
import path from "path";

// Load env (same behavior as server/start.js)
dotenv.config({ path: path.join(process.cwd(), ".env") });

import { sendEmail } from "../utils/sendEmail.js";

// Recipients come from the command line, or TEST_EMAIL_RECIPIENTS in .env as a
// comma-separated list. Addresses are deliberately not hardcoded here — this
// repo is public and committed inboxes get scraped.
//
//   node server/scripts/send_test_email.js you@example.com
const cliRecipients = process.argv.slice(2).filter(Boolean);
const envRecipients = (process.env.TEST_EMAIL_RECIPIENTS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);
const recipients = cliRecipients.length ? cliRecipients : envRecipients;

if (!recipients.length) {
  console.error(
    "No recipients. Pass them as arguments or set TEST_EMAIL_RECIPIENTS in .env:\n" +
      "  node server/scripts/send_test_email.js you@example.com"
  );
  process.exit(1);
}

(async () => {
  for (const to of recipients) {
    try {
      console.log(`Sending test email to ${to}...`);
      const resp = await sendEmail({
        to,
        subject: "Cinemetrics — Delivery test",
        html: `<p>This is a delivery test for ${to} sent at ${new Date().toISOString()}</p>`
      });
      console.log(
        `Done ${to}:`,
        typeof resp === "object" ? JSON.stringify(resp).slice(0, 800) : resp
      );
    } catch (err) {
      console.error(
        `Error sending to ${to}:`,
        err && err.message ? err.message : err
      );
    }
  }
  process.exit(0);
})();
