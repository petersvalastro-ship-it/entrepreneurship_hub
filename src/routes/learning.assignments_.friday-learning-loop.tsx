import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/friday-learning-loop")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Friday Learning Loop · NEIA Entrepreneur Hub" },
      { name: "description", content: "Week in Four Frames: connect the week through a team synthesis and individual reflection." },
      { property: "og:title", content: "Friday Learning Loop · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Complete the Friday Learning Loop assignment and email your PDF to your teacher." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FridayLoopRoute,
});

function FridayLoopRoute() {
  return <EntrepreneurshipApp initialTab="assignmentFriday" />;
}
