import PageIntro from "@/components/sections/page-intro";
import ProjectGrid from "@/components/sections/project-grid";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Practical products I've designed and built, from desktop and mobile apps to full web platforms.",
  path: "/projects",
});

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const { open } = await searchParams;

  return (
    <>
      <PageIntro
        kicker="Selected work"
        title="Projects."
        description="Practical products I've designed and built — from desktop and mobile apps to full web platforms."
      />
      <ProjectGrid initialOpenSlug={open} />
    </>
  );
}
