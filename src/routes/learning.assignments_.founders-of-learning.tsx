import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/founders-of-learning")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Founders of Learning · NEIA Entrepreneur Hub" },
      { name: "description", content: "Build, Teach, Improve: plan and teach a 10-minute partner entrepreneurship lesson." },
      { property: "og:title", content: "Founders of Learning · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Complete the Founders of Learning planning guide and email your PDF to your teacher." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FoundersRoute,
});

function FoundersRoute() {
  return <EntrepreneurshipApp initialTab="assignmentFounders" />;
}
