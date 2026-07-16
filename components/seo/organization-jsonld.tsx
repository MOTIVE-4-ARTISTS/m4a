import { ORG } from "@/lib/org";
import { resolveSiteUrl } from "@/lib/site-url";

// Schema.org Organization JSON-LD. Gives search engines and grant directories
// a structured handle on our legal identity and mission. Lives in the root
// layout so every page emits it; per-page Person / Event / Article JSON-LD is
// added in the routes that own that content.
export function OrganizationJsonLd() {
  const siteUrl = resolveSiteUrl();
  const json = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: ORG.displayName,
    legalName: ORG.legalName,
    url: siteUrl,
    logo: `${siteUrl}/brand/logo-square.png`,
    description:
      "An artist-first organization rooted in New York City and working across disciplines and borders through residencies, exchanges, resources, and subsidized space.",
    foundingDate: ORG.incorporationDate,
    foundingLocation: { "@type": "Place", name: "New York, NY" },
    // City-level only: the registered street address is the founders' home, so
    // we don't feed it to search engines / grant directories as a venue. The
    // full address still appears where legally required (donation disclosures,
    // receipts).
    address: {
      "@type": "PostalAddress",
      addressLocality: ORG.address.city,
      addressRegion: ORG.address.state,
      addressCountry: ORG.address.country,
    },
    email: ORG.contact.email,
    nonprofitStatus: ORG.irsStatus === "approved" ? "Nonprofit501c3" : undefined,
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
