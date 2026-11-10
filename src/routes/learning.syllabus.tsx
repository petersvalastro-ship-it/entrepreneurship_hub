import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/syllabus")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Course Syllabus · NEIA Entrepreneur Hub" },
      { name: "description", content: "MS Entrepreneurship syllabus: outcomes, trimester timeline, assignments, and class policies for grades 7 & 8." },
      { property: "og:title", content: "Course Syllabus · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Entrepreneurial Mindset through Case Studies — Fall Trimester syllabus." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SyllabusRoute,
});

function SyllabusRoute() {
  return <EntrepreneurshipApp initialTab="syllabus" />;
}
