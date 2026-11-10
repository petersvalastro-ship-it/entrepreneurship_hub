import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/friction-to-opportunity")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "From Friction to Opportunity · NEIA Entrepreneur Hub" },
      { name: "description", content: "Tuesday, November 10, 2026 — separate needs from wants, observe a school routine, and frame an opportunity." },
      { property: "og:title", content: "From Friction to Opportunity · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Tuesday, November 10, 2026 — separate needs from wants, observe a school routine, and frame an opportunity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FrictionRoute,
});

function FrictionRoute() {
  return <EntrepreneurshipApp initialTab="assignmentCh2Tue" />;
}
