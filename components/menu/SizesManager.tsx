"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { menuOptionsApi } from "@/lib/api/menuOptions";
import type { SizeVariantResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

export function SizesManager({
  accessToken,
  websiteId,
  itemId,
  currency,
}: {
  accessToken: string;
  websiteId: string;
  itemId: string;
  currency: string;
}) {
  const [sizes, setSizes] = useState<SizeVariantResponse[]>([]);
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    setSizes(await menuOptionsApi.listSizes(accessToken, websiteId, itemId));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, websiteId, itemId]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!label.trim() || !price) return;
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.addSize(accessToken, websiteId, itemId, { label: label.trim(), price });
      setLabel("");
      setPrice("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add size.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(sizeId: string) {
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.deleteSize(accessToken, websiteId, itemId, sizeId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete size.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="error">{error}</Alert>}
      <ul className="flex flex-col gap-1.5">
        {sizes.map((size) => (
          <li key={size.id} className="flex items-center justify-between rounded-lg border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145]">
            <span>
              {size.label} · {formatMoney(size.price, currency)}
            </span>
            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(size.id)}>
              Remove
            </button>
          </li>
        ))}
        {sizes.length === 0 && <p className="text-sm text-zinc-500">No sizes yet.</p>}
      </ul>
      <form onSubmit={handleAdd} className="flex items-end gap-2">
        <TextField id="sizeLabel" label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <TextField id="sizePrice" label="Price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Button type="submit" isLoading={isBusy} className="w-auto px-4">
          Add
        </Button>
      </form>
    </div>
  );
}
