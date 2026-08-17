import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ websiteId: string; rest: string[] }>;
}

/**
 * Anything under /manage/<id> that is not a real page lands back on the
 * website's overview instead of a 404.
 *
 * Setup pages come and go - SEO was removed, the wizard has been renumbered
 * more than once - and an owner keeps the old URL in a tab or a bookmark long
 * after. Every one of those turned into "This page could not be found", which
 * reads like the whole dashboard is broken rather than like one page moved.
 * There is nothing under here worth a 404: the overview is always the right
 * place to be sent.
 */
export default async function UnknownManagePage({ params }: Props) {
  const { websiteId } = await params;
  redirect(`/manage/${websiteId}`);
}
