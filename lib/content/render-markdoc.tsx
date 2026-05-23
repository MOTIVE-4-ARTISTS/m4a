import "server-only";
import * as Markdoc from "@markdoc/markdoc";
import * as React from "react";

// Minimal Markdoc renderer. Keystatic stores rich-text fields as a Markdoc
// AST node; we transform to a renderable tree at render time.
//
// The output is wrapped by <Prose /> at every call site so headings,
// paragraphs, and lists pick up our editorial type rules without each node
// having to know about them.
export function MarkdocContent({ node }: { node: { node: Markdoc.Node } }) {
  const rendered = Markdoc.transform(node.node, {});
  return <>{Markdoc.renderers.react(rendered, React)}</>;
}
