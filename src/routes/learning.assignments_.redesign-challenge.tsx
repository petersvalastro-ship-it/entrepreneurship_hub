import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/redesign-challenge")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Redesign Challenge · NEIA Entrepreneur Hub" },
      { name: "description", content: "Friday, November 13, 2026 — Chapter 2 review, peer feedback, revision and a two-minute presentation." },
      { property: "og:title", content: "Redesign Challenge · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Friday, November 13, 2026 — Chapter 2 review, peer feedback, revision and a two-minute presentation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RedesignRoute,
});

function RedesignRoute() {
  return <EntrepreneurshipApp initialTab="assignmentCh2Fri" />;
}
