import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ websiteId: string }>;
}

/**
 * The site admin moved to /manage/{id}, out from under the platform's own
 * dashboard. This keeps every link already in the wild - bookmarks, the QR
 * card, invitation emails - pointing somewhere that works.
 */
export default async function LegacyWebsiteRedirect({ params }: Props) {
  const { websiteId } = await params;
  redirect(`/manage/${websiteId}`);
}
