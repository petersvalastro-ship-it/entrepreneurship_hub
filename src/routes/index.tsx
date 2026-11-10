import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "NEIA Entrepreneur Hub" },
      {
        name: "description",
        content:
          "Interactive glossary, profit calculators, practice scenarios, and a venture simulator to teach entrepreneurship fundamentals.",
      },
      { property: "og:title", content: "NEIA Entrepreneur Hub" },
      {
        property: "og:description",
        content:
          "Learn entrepreneurship with an interactive glossary, calculators, scenarios, and a venture simulator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <EntrepreneurshipApp />;
}
