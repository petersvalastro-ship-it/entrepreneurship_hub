import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/cases-and-scamper")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Cases and SCAMPER · NEIA Entrepreneur Hub" },
      { name: "description", content: "Thursday, November 12, 2026 — compare the Canva and Bevel founders and generate redesign ideas with SCAMPER." },
      { property: "og:title", content: "Cases and SCAMPER · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Thursday, November 12, 2026 — compare the Canva and Bevel founders and generate redesign ideas with SCAMPER." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ScamperRoute,
});

function ScamperRoute() {
  return <EntrepreneurshipApp initialTab="assignmentCh2Thu" />;
}
