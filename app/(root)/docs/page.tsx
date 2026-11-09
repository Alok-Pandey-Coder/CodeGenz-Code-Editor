import { FeatureGrid, PageCta, SitePage, pageIcons } from "@/modules/home/site-page";

export default function DocsPage() {
  return (
    <SitePage
      eyebrow="Documentation"
      title="Build faster with VibeCode."
      description="Everything you need to create, edit, preview, and ship modern web projects from one focused workspace."
    >
      <FeatureGrid
        items={[
          { icon: pageIcons.rocket, title: "Start a project", description: "Choose a starter, open the editor, and get a working project in seconds." },
          { icon: pageIcons.code, title: "Edit with confidence", description: "Use Monaco-powered editing, file navigation, and AI suggestions without leaving your project." },
          { icon: pageIcons.terminal, title: "Run and preview", description: "Install dependencies, run commands, and see your changes in the live preview." },
        ]}
      />
      <PageCta href="/dashboard">Open your workspace</PageCta>
    </SitePage>
  );
}
