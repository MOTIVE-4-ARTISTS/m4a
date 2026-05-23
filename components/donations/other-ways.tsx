import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ORG } from "@/lib/org";

// "Other ways to give" — stock, DAF, crypto, check, ACH. The interactive
// widgets (Every.org Donate Button, DAF Direct widget) require a verified
// 501(c)(3) profile, so they're commented out until determination lands.
// Until then we route donors through email + the fiscal sponsor.
export function OtherWaysToGive() {
  return (
    <Card>
      <CardEyebrow>Other ways to give</CardEyebrow>
      <CardTitle className="mt-2">Stock, DAF, check, or ACH</CardTitle>
      <ul className="mt-4 space-y-3 text-sm">
        <li>
          <strong>Donor-advised fund (DAF), stock, or crypto.</strong> Once our 501(c)(3)
          determination is in hand, we'll embed Every.org's donate widget (with DAF Direct support)
          here. Until then, email{" "}
          <a
            className="underline decoration-[var(--color-brand-deep)] underline-offset-4"
            href={`mailto:${ORG.contact.email}?subject=DAF/stock%20gift`}
          >
            {ORG.contact.email}
          </a>{" "}
          and we'll coordinate through our fiscal sponsor.
        </li>
        <li>
          <strong>Check.</strong> Payable to <em>The Field</em>, with "{ORG.displayName} earmark" in
          the memo. Mail to {ORG.fiscalSponsor.address}.
        </li>
        <li>
          <strong>ACH / wire.</strong> Email us for bank details.
        </li>
        <li>
          <strong>In-kind gifts</strong> (equipment, services, professional time): we welcome them.
          Email us first so we can acknowledge them correctly in our books.
        </li>
      </ul>
    </Card>
  );
}
