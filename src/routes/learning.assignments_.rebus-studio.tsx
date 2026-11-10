import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/rebus-studio")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Entrepreneurial Rebus Studio · NEIA Entrepreneur Hub" },
      { name: "description", content: "Design, peer-test and revise entrepreneurship rebus puzzles." },
      { property: "og:title", content: "Entrepreneurial Rebus Studio · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Complete the Rebus Studio assignment and email your PDF to your teacher." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RebusStudioRoute,
});

function RebusStudioRoute() {
  return <EntrepreneurshipApp initialTab="assignmentRebus" />;
}
