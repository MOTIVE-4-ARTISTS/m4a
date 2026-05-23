import "server-only";
import { Resend } from "resend";
import { publicEnv } from "@/lib/env/public";
import { serverEnv } from "@/lib/env/server";
import { ein, ORG } from "@/lib/org";

// Donation receipt email. Compliant with IRS §170(f)(8) substantiation
// requirements:
//   - Date and amount of the gift
//   - Statement that no goods or services were received in exchange
//   - Org legal name + EIN + 501(c)(3) status line
//
// We send for every donation (not only those ≥ $250) because (a) it's
// good donor experience and (b) it future-proofs the year-end consolidated
// statement workflow.

type Args = {
  to: string;
  name?: string;
  amountCents: number;
  currency: string;
  date: Date;
  recurring: boolean;
  sessionId: string;
};

export async function sendDonationReceipt(args: Args) {
  if (!serverEnv.RESEND_API_KEY) {
    console.warn("[receipt] RESEND_API_KEY missing — receipt not sent:", args.sessionId);
    return;
  }

  const resend = new Resend(serverEnv.RESEND_API_KEY);
  const amount = (args.amountCents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: args.currency.toUpperCase(),
  });
  const formattedDate = args.date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const greeting = args.name ? `Dear ${args.name},` : "Dear friend,";

  // Single transactional HTML — no SaaS-template lock-in. React Email
  // adoption is deferred to Phase 7 when we wire newsletter Broadcasts;
  // until then this string template is auditable in one place.
  const html = `<!doctype html>
<html lang="en"><body style="font-family: ui-sans-serif, system-ui, sans-serif; color: #1a1a1a; max-width: 640px; margin: 0 auto; padding: 32px 24px;">
  <p style="font-size: 14px; color: #56544b; text-transform: uppercase; letter-spacing: .15em;">Donation receipt</p>
  <h1 style="font-size: 24px; margin: 12px 0 24px;">Thank you for supporting MOtiVE 4 Artists.</h1>
  <p>${greeting}</p>
  <p>This email is your official receipt for the donation listed below. Please keep it for your tax records.</p>

  <table style="border-collapse: collapse; width: 100%; margin: 24px 0; background: #f3ede0;">
    <tr><td style="padding: 12px 16px; color: #56544b;">Amount</td><td style="padding: 12px 16px; text-align: right;"><strong>${amount}</strong>${args.recurring ? " (recurring monthly)" : ""}</td></tr>
    <tr><td style="padding: 12px 16px; color: #56544b; border-top: 1px solid #e3ded1;">Date</td><td style="padding: 12px 16px; text-align: right; border-top: 1px solid #e3ded1;">${formattedDate}</td></tr>
    <tr><td style="padding: 12px 16px; color: #56544b; border-top: 1px solid #e3ded1;">Reference</td><td style="padding: 12px 16px; text-align: right; border-top: 1px solid #e3ded1; font-family: ui-monospace, monospace; font-size: 12px;">${args.sessionId}</td></tr>
  </table>

  <p><strong>No goods or services were provided in exchange for this contribution.</strong></p>

  <p>${ORG.legalName}<br>
  ${ORG.address.street}, ${ORG.address.city}, ${ORG.address.state} ${ORG.address.postal}<br>
  EIN: ${ein()}<br>
  ${
    ORG.irsStatus === "approved"
      ? "Donations are tax-deductible under §501(c)(3)."
      : "Federal 501(c)(3) tax-exempt status pending — IRS Form 1023-EZ submitted May 2026. While pending, gifts are routed through our fiscal sponsor The Field; this receipt confirms the earmarked contribution."
  }</p>

  <hr style="border: 0; border-top: 1px solid #e3ded1; margin: 32px 0;">

  <p style="font-size: 12px; color: #56544b;">
    Questions about this receipt: reply to this email or contact ${ORG.contact.email}.<br>
    ${publicEnv.NEXT_PUBLIC_SITE_URL}
  </p>
</body></html>`;

  await resend.emails.send({
    from: `${ORG.contact.sender} <${serverEnv.RESEND_FROM_EMAIL}>`,
    to: args.to,
    subject: `Your donation to ${ORG.displayName} — receipt`,
    html,
    text: `Thank you for your donation of ${amount} on ${formattedDate}. Reference: ${args.sessionId}. No goods or services were provided in exchange. ${ORG.legalName}, EIN ${ein()}.`,
  });
}
