import { FeatureGrid, PageCta, SitePage, pageIcons } from "@/modules/home/site-page";

export default function ResourcesPage() {
  return (
    <SitePage
      eyebrow="Resources"
      title="A better path from idea to product."
      description="Explore practical guides, starter templates, and workflows designed for makers who want to spend less time configuring and more time building."
    >
      <FeatureGrid
        items={[
          { icon: pageIcons.sparkles, title: "Starter templates", description: "Begin with a clean foundation for React, Next.js, Vue, and more." },
          { icon: pageIcons.book, title: "Guides and patterns", description: "Learn the editor workflow and ship polished experiences with proven patterns." },
          { icon: pageIcons.code, title: "Reusable building blocks", description: "Keep your projects consistent with components and snippets you can reuse." },
        ]}
      />
      <PageCta href="/docs">Browse the documentation</PageCta>
    </SitePage>
  );
}
