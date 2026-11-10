import { createFileRoute } from "@tanstack/react-router";
import EntrepreneurshipApp from "@/components/EntrepreneurshipApp";
import { requireSiteAccess } from "@/lib/gate.functions";

export const Route = createFileRoute("/learning/case-studies")({
  beforeLoad: () => requireSiteAccess(),
  head: () => ({
    meta: [
      { title: "Case Studies · NEIA Entrepreneur Hub" },
      { name: "description", content: "25 direct case readings on founders, with mindset traits and presentation questions." },
      { property: "og:title", content: "Case Studies · NEIA Entrepreneur Hub" },
      { property: "og:description", content: "Search and filter 25 entrepreneur case readings by founder and mindset trait." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CaseStudiesRoute,
});

function CaseStudiesRoute() {
  return <EntrepreneurshipApp initialTab="casestudies" />;
}
