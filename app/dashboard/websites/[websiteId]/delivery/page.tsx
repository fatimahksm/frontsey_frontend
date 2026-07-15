"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { deliveryApi } from "@/lib/api/delivery";
import type { DeliveryAreaResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useWebsite } from "@/lib/website/website-context";

export default function DeliveryAreasPage() {
  const { website, accessToken } = useWebsite();
  const [areas, setAreas] = useState<DeliveryAreaResponse[]>([]);
  const [name, setName] = useState("");
  const [fee, setFee] = useState("");
  const [minimumOrder, setMinimumOrder] = useState("");
  const [freeThreshold, setFreeThreshold] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    setAreas(await deliveryApi.list(accessToken, website.id));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load delivery areas."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !fee || !minimumOrder) return;
    setError(null);
    setIsBusy(true);
    try {
      await deliveryApi.create(accessToken, website.id, {
        name: name.trim(),
        fee,
        minimumOrder,
        freeThreshold: freeThreshold || undefined,
      });
      setName("");
      setFee("");
      setMinimumOrder("");
      setFreeThreshold("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add delivery area.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await deliveryApi.delete(accessToken, website.id, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete delivery area.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Delivery areas</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Areas">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {areas.map((area) => (
              <li key={area.id} className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
                <div>
                  <p className="font-medium">{area.name}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Fee {formatMoney(area.deliveryFee, website.currency)} · Min order {formatMoney(area.minimumOrderAmount, website.currency)}
                    {area.freeDeliveryThreshold != null && (
                      <> · Free above {formatMoney(area.freeDeliveryThreshold, website.currency)}</>
                    )}
                  </p>
                </div>
                <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(area.id)}>
                  Delete
                </button>
              </li>
            ))}
            {areas.length === 0 && <p className="text-sm text-zinc-500">No delivery areas yet.</p>}
          </ul>
        )}

        <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField id="areaName" label="Area name" value={name} onChange={(e) => setName(e.target.value)} />
          <TextField id="areaFee" label="Delivery fee" type="number" step="0.01" min="0" value={fee} onChange={(e) => setFee(e.target.value)} />
          <TextField
            id="areaMinimumOrder"
            label="Minimum order amount"
            type="number"
            step="0.01"
            min="0"
            value={minimumOrder}
            onChange={(e) => setMinimumOrder(e.target.value)}
          />
          <TextField
            id="areaFreeThreshold"
            label="Free delivery above (optional)"
            type="number"
            step="0.01"
            min="0"
            value={freeThreshold}
            onChange={(e) => setFreeThreshold(e.target.value)}
          />
          <Button type="submit" isLoading={isBusy} className="w-auto px-5 sm:col-span-2">
            Add delivery area
          </Button>
        </form>
      </Card>
    </div>
  );
}
