"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { friendlyMessage } from "@/lib/api/client";
import { menuOptionsApi } from "@/lib/api/menuOptions";
import type { BoxVariantResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

export function BoxVariantsManager({
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
  const [variants, setVariants] = useState<BoxVariantResponse[]>([]);
  const [label, setLabel] = useState("");
  const [unitCount, setUnitCount] = useState("");
  const [price, setPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    setVariants(await menuOptionsApi.listBoxVariants(accessToken, websiteId, itemId));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, websiteId, itemId]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!label.trim() || !unitCount || !price) return;
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.addBoxVariant(accessToken, websiteId, itemId, {
        label: label.trim(),
        unitCount: Number(unitCount),
        price,
      });
      setLabel("");
      setUnitCount("");
      setPrice("");
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to add box variant."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(variantId: string) {
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.deleteBoxVariant(accessToken, websiteId, itemId, variantId);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to delete box variant."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="error">{error}</Alert>}
      <ul className="flex flex-col gap-1.5">
        {variants.map((v) => (
          <li key={v.id} className="flex items-center justify-between rounded-lg border border-black/[.08] px-3 py-2 text-sm dark:border-white/[.145]">
            <span>
              {v.label} · {v.unitCount} units · {formatMoney(v.price, currency)}
            </span>
            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleDelete(v.id)}>
              Remove
            </button>
          </li>
        ))}
        {variants.length === 0 && <p className="text-sm text-zinc-500">No box variants yet.</p>}
      </ul>
      <form onSubmit={handleAdd} className="flex items-end gap-2">
        <TextField id="boxLabel" label="Label" value={label} onChange={(e) => setLabel(e.target.value)} />
        <TextField id="boxUnitCount" label="Unit count" type="number" min="1" value={unitCount} onChange={(e) => setUnitCount(e.target.value)} />
        <TextField id="boxPrice" label="Price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Button type="submit" isLoading={isBusy} className="w-auto px-4">
          Add
        </Button>
      </form>
    </div>
  );
}
