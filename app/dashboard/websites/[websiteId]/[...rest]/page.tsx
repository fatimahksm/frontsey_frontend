import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ websiteId: string; rest: string[] }>;
}

/** Same redirect as the parent, for the sub-pages (menu, theme, share, setup, …). */
export default async function LegacyWebsiteSubpageRedirect({ params }: Props) {
  const { websiteId, rest } = await params;
  redirect(`/manage/${websiteId}/${rest.join("/")}`);
}
