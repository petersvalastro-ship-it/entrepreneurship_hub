import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Assignments · NEIA Entrepreneur Hub" },
      { name: "description", content: "Class assignments for MS Entrepreneurship, including the Assumption Buster activity." },
      { property: "og:title", content: "Assignments · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Open and complete your MS Entrepreneurship assignments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssignmentsRoute,
});

function AssignmentsRoute() {
  return <EntrepreneurshipApp initialTab="assignments" />;
}
