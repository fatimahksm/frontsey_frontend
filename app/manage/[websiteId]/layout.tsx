import type { ReactNode } from "react";

import { ConsoleShell } from "@/components/console/ConsoleShell";

interface Props {
  children: ReactNode;
  params: Promise<{ websiteId: string }>;
}

export default async function WebsiteLayout({ children, params }: Props) {
  const { websiteId } = await params;
  return <ConsoleShell websiteId={websiteId}>{children}</ConsoleShell>;
}
