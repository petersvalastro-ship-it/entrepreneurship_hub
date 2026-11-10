import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/assignments_/lesson/$slug")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Class Lesson · NEIA Entrepreneur Hub" },
      { name: "description", content: "Complete this week's MS Entrepreneurship lesson and submit it to Pietro." },
      { property: "og:title", content: "Class Lesson · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Complete this MS Entrepreneurship lesson and submit it to your teacher." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LessonRoute,
});

function LessonRoute() {
  const { slug } = Route.useParams();
  return <EntrepreneurshipApp initialTab={`lesson:${slug}`} />;
}
