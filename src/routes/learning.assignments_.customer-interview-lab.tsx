import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/customer-interview-lab")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Customer Interview Lab · NEIA Entrepreneur Hub" },
      { name: "description", content: "Plan and run a customer interview to turn assumptions into evidence." },
      { property: "og:title", content: "Customer Interview Lab · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Complete the Customer Interview Lab assignment and email your PDF to your teacher." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: InterviewLabRoute,
});

function InterviewLabRoute() {
  return <EntrepreneurshipApp initialTab="assignmentInterview" />;
}
