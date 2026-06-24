import { Card, CardEyebrow, CardTitle } from "@/components/ui/card";
import { ORG } from "@/lib/org";

// "Other ways to give" — stock, DAF, crypto, check, ACH. The interactive
// widgets (Every.org Donate Button, DAF Direct widget) are wired up once the
// org's Every.org profile is live; until then we coordinate these gifts by
// email and accept checks/ACH directly.
export function OtherWaysToGive() {
  return (
    <Card>
      <CardEyebrow>Other ways to give</CardEyebrow>
      <CardTitle className="mt-2">Stock, DAF, check, or ACH</CardTitle>
      <ul className="mt-4 space-y-3 text-sm">
        <li>
          <strong>Donor-advised fund (DAF), stock, or crypto.</strong> We'll embed Every.org's
          donate widget (with DAF Direct support) here soon. In the meantime, email{" "}
          <a
            className="underline decoration-[var(--color-brand-deep)] underline-offset-4"
            href={`mailto:${ORG.contact.email}?subject=DAF/stock%20gift`}
          >
            {ORG.contact.email}
          </a>{" "}
          and we'll coordinate the gift.
        </li>
        <li>
          <strong>Check.</strong> Payable to <em>{ORG.legalName}</em>. Mail to {ORG.address.street},{" "}
          {ORG.address.city}, {ORG.address.state} {ORG.address.postal}.
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
