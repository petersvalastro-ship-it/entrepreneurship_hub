import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/assumption-buster")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Assumption Buster · NEIA Entrepreneur Hub" },
      { name: "description", content: "10/19/26 assignment: test a common assumption about entrepreneurs with research and evidence." },
      { property: "og:title", content: "Assumption Buster · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Complete the Assumption Buster assignment and email your PDF to your teacher." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AssumptionBusterRoute,
});

function AssumptionBusterRoute() {
  return <EntrepreneurshipApp initialTab="assignment1019" />;
}
