import type { ReactNode } from "react";

import { WebsiteShell } from "@/components/dashboard/WebsiteShell";

interface Props {
  children: ReactNode;
  params: Promise<{ websiteId: string }>;
}

export default async function WebsiteLayout({ children, params }: Props) {
  const { websiteId } = await params;
  return <WebsiteShell websiteId={websiteId}>{children}</WebsiteShell>;
}
