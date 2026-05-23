import { publicEnv } from "@/lib/env/public";
import { ein, ORG } from "@/lib/org";

// Schema.org Organization JSON-LD. Gives search engines and grant directories
// a structured handle on our legal identity, mission, and EIN. Lives in the
// root layout so every page emits it; per-page Person / Event / Article
// JSON-LD is added in the routes that own that content.
export function OrganizationJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: ORG.displayName,
    legalName: ORG.legalName,
    url: publicEnv.NEXT_PUBLIC_SITE_URL,
    logo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/brand/logo-square.png`,
    description:
      "A New York-incorporated nonprofit corporation supporting interdisciplinary movement-based artists through performances, artistic development, community engagement, and educational programming.",
    foundingDate: ORG.incorporationDate,
    foundingLocation: { "@type": "Place", name: "New York, NY" },
    address: {
      "@type": "PostalAddress",
      streetAddress: ORG.address.street,
      addressLocality: ORG.address.city,
      addressRegion: ORG.address.state,
      postalCode: ORG.address.postal,
      addressCountry: ORG.address.country,
    },
    email: ORG.contact.email,
    nonprofitStatus: ORG.irsStatus === "approved" ? "Nonprofit501c3" : undefined,
    taxID: ein(),
    member: ORG.board.map((b) => ({ "@type": "Person", name: b.name, jobTitle: b.role })),
  };

  // dangerouslySetInnerHTML is the canonical pattern for JSON-LD in React.
  // Content is fully under our control (no user input), so XSS surface is nil.
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is the canonical pattern for structured data
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
