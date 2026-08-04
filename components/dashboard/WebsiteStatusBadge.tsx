import { Badge } from "@/components/ui/Badge";
import type { WebsiteStatus } from "@/lib/api/types";

const TONE: Record<WebsiteStatus, "neutral" | "success" | "warning" | "danger"> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  SUSPENDED_TEMPORARY: "warning",
  SUSPENDED_PERMANENT: "danger",
  EXPIRED: "warning",
  TRASHED: "danger",
  DELETED: "danger",
};

const LABEL: Record<WebsiteStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  SUSPENDED_TEMPORARY: "Suspended (temporary)",
  SUSPENDED_PERMANENT: "Suspended (permanent)",
  EXPIRED: "Expired",
  TRASHED: "Trashed",
  DELETED: "Deleted",
};

export function WebsiteStatusBadge({ status }: { status: WebsiteStatus }) {
  return <Badge tone={TONE[status]}>{LABEL[status]}</Badge>;
}
