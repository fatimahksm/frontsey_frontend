import { PublicSite } from "@/components/public/PublicSite";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function PublicSitePage({ params }: Props) {
  const { slug } = await params;
  return <PublicSite slug={slug} />;
}
