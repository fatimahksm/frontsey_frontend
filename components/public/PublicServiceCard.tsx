import type { PublicService } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

export function PublicServiceCard({ service, currency }: { service: PublicService; currency: string }) {
  return (
    <li className="flex gap-4 rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]">
      {service.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URL
        <img src={service.imageUrl} alt="" className="h-20 w-20 shrink-0 rounded-lg object-cover" />
      )}
      <div className="min-w-0">
        <p className="font-medium">{service.name}</p>
        {service.description && <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{service.description}</p>}
        <p className="mt-1 text-sm font-medium">
          {service.price != null ? formatMoney(service.price, currency) : "Priced on request"}
        </p>
      </div>
    </li>
  );
}
