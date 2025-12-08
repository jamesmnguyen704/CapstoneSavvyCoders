import dotenv from "dotenv";
import path from "path";

// Load env (same behavior as server/start.js)
dotenv.config({ path: path.join(process.cwd(), ".env") });

import { sendEmail } from "../utils/sendEmail.js";

// Default recipients (match your Resend audience screenshot)
const defaultRecipients = [
  "jamesmnguyen704@yahoo.com",
  "jamesmnguyen704@gmail.com",
  "nguyenjames704@yahoo.com",
  "jamesmnguyen704@outlook.com"
];

// Allow passing recipients as command-line args: `node send_test_email.js addr1 addr2`
const cliRecipients = process.argv.slice(2).filter(Boolean);
const recipients = cliRecipients.length ? cliRecipients : defaultRecipients;

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
