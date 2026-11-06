import { redirect } from "next/navigation";

/**
 * The index now lives on the home page. Old links keep working:
 * `/projects?open=slug` (the retired modal) lands on that case study.
 */
export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const { open } = await searchParams;
  redirect(open ? `/projects/${encodeURIComponent(open)}` : "/");
}
