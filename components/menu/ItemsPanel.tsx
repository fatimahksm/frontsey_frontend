"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import type { CategoryDto, ItemAvailability, MenuItemResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

interface Props {
  accessToken: string;
  websiteId: string;
  currency: string;
  categories: CategoryDto[];
}

export function ItemsPanel({ accessToken, websiteId, currency, categories }: Props) {
  const [items, setItems] = useState<MenuItemResponse[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTargetCategory, setBulkTargetCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  function categoryName(id: string): string {
    return categories.find((c) => c.id === id)?.name ?? "-";
  }

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      const fetched = showTrash
        ? await menuApi.listTrashedItems(accessToken, websiteId)
        : await menuApi.listItems(accessToken, websiteId, {
            categoryId: categoryFilter || undefined,
            search: search || undefined,
          });
      setItems(fetched);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load menu items.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, websiteId, showTrash]);

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function withBusy(action: () => Promise<unknown>) {
    setError(null);
    setIsBusy(true);
    try {
      await action();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "That action failed.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleBulkAvailability(availability: ItemAvailability) {
    await withBusy(() => menuApi.bulkAvailability(accessToken, websiteId, [...selected], availability));
  }

  async function handleBulkTrash() {
    await withBusy(() => menuApi.bulkTrash(accessToken, websiteId, [...selected]));
  }

  async function handleBulkMoveCategory() {
    if (!bulkTargetCategory) return;
    await withBusy(() => menuApi.bulkMoveCategory(accessToken, websiteId, [...selected], bulkTargetCategory));
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}

      <div className="flex flex-wrap items-end gap-3">
        {!showTrash && (
          <>
            <Select id="categoryFilter" label="Category" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); }}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <TextField id="search" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button className="w-auto px-4" onClick={load} isLoading={isLoading}>
              Apply
            </Button>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          <Link href={`/dashboard/websites/${websiteId}/menu/import`} className="text-sm font-medium hover:underline">
            Import CSV
          </Link>
          <Link href={`/dashboard/websites/${websiteId}/menu/items/new`}>
            <Button className="w-auto px-4">Add item</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={() => setShowTrash(false)}
          className={`rounded-full px-3 py-1 ${!showTrash ? "bg-foreground text-background" : "text-zinc-500"}`}
        >
          Active
        </button>
        <button
          type="button"
          onClick={() => setShowTrash(true)}
          className={`rounded-full px-3 py-1 ${showTrash ? "bg-foreground text-background" : "text-zinc-500"}`}
        >
          Trash
        </button>
      </div>

      {selected.size > 0 && !showTrash && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-black/[.03] p-3 text-sm dark:bg-white/[.05]">
          <span className="font-medium">{selected.size} selected</span>
          <Button className="w-auto px-3" onClick={() => handleBulkAvailability("AVAILABLE")} isLoading={isBusy}>
            Mark available
          </Button>
          <Button className="w-auto px-3" onClick={() => handleBulkAvailability("UNAVAILABLE")} isLoading={isBusy}>
            Mark unavailable
          </Button>
          <Button variant="secondary" className="w-auto px-3" onClick={handleBulkTrash} isLoading={isBusy}>
            Move to trash
          </Button>
          <Select
            id="bulkTargetCategory"
            label=""
            value={bulkTargetCategory}
            onChange={(e) => setBulkTargetCategory(e.target.value)}
            className="h-9"
          >
            <option value="">Move to category…</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            className="w-auto px-3"
            onClick={handleBulkMoveCategory}
            isLoading={isBusy}
            disabled={!bulkTargetCategory}
          >
            Move
          </Button>
        </div>
      )}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-zinc-500">{showTrash ? "Trash is empty." : "No menu items yet."}</p>
      ) : (
        <StaggerGroup as="ul" className="flex flex-col gap-2">
          {items.map((item) => (
            <StaggerItem
              as="li"
              key={item.id}
              className="flex items-center gap-3 rounded-lg border border-black/[.08] p-3 transition-colors dark:border-white/[.145]"
            >
              {!showTrash && (
                <input
                  type="checkbox"
                  checked={selected.has(item.id)}
                  onChange={() => toggleSelected(item.id)}
                  className="h-4 w-4"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/websites/${websiteId}/menu/items/${item.id}`} className="truncate font-medium hover:underline">
                    {item.name}
                  </Link>
                  <Badge tone={item.availability === "AVAILABLE" ? "success" : "warning"}>
                    {item.availability === "AVAILABLE" ? "Available" : "Unavailable"}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {categoryName(item.categoryId)} · {formatMoney(item.discountPrice ?? item.price, currency)}
                  {item.discountPrice != null && (
                    <span className="ml-1 line-through">{formatMoney(item.price, currency)}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                {showTrash ? (
                  <button
                    type="button"
                    className="font-medium text-foreground hover:underline"
                    onClick={() => withBusy(() => menuApi.restoreItem(accessToken, websiteId, item.id))}
                  >
                    Restore
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="text-zinc-500 hover:underline"
                      onClick={() => withBusy(() => menuApi.duplicateItem(accessToken, websiteId, item.id))}
                    >
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => withBusy(() => menuApi.trashItem(accessToken, websiteId, item.id))}
                    >
                      Trash
                    </button>
                  </>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
