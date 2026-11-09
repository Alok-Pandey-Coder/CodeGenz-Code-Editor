import { Code2 } from "lucide-react";
import { FeatureGrid, PageCta, SitePage, pageIcons } from "@/modules/home/site-page";

export default function ApiPage() {
  return (
    <SitePage eyebrow="VibeCode API" title="Bring your workflow into your tools." description="Use the VibeCode API to automate project creation, template workflows, and code generation in your own products.">
      <FeatureGrid items={[
        { icon: <Code2 className="h-5 w-5" />, title: "Project automation", description: "Create and manage playgrounds from your own applications." },
        { icon: pageIcons.terminal, title: "Code workflows", description: "Connect generation and completion workflows to your development tools." },
        { icon: pageIcons.book, title: "Simple integration", description: "Start with clear endpoints and predictable responses as your integration grows." },
      ]} />
      <PageCta href="/contact">Talk to the team</PageCta>
    </SitePage>
  );
}
