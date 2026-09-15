"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { friendlyMessage } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import type { CategoryDto, ItemAvailability, MenuItemResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { categoryPathLabel, categorySelectOptions } from "@/lib/menu/category-tree";

interface Props {
  accessToken: string;
  websiteId: string;
  currency: string;
  categories: CategoryDto[];
}

/** Rows per request. A shop with two thousand items used to send all two thousand to draw this list. */
const PAGE_SIZE = 50;

/** What MenuController clamps `size` to; asking for more than this silently gets this. */
const SERVER_MAX_PAGE_SIZE = 200;

export function ItemsPanel({ accessToken, websiteId, currency, categories }: Props) {
  const [items, setItems] = useState<MenuItemResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [lastPage, setLastPage] = useState(0);
  const [showTrash, setShowTrash] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"" | ItemAvailability>("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTargetCategory, setBulkTargetCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  /** "Coffee › Iced" for a sub-category, so the list never shows an ambiguous bare child name. */
  function categoryName(id: string): string {
    const category = categories.find((c) => c.id === id);
    return category ? categoryPathLabel(category, categories) : "-";
  }

  const visibleItems = availabilityFilter ? items.filter((item) => item.availability === availabilityFilter) : items;

  /**
   * Trash is not paged: it is what the owner deleted in the last thirty days,
   * and the backend returns it as a plain list.
   */
  async function loadTrash() {
    const fetched = await menuApi.listTrashedItems(accessToken, websiteId);
    setItems(fetched);
    setTotal(fetched.length);
    setHasMore(false);
    setLastPage(0);
  }

  /**
   * One request for `size` rows starting at `page`, either replacing what is
   * on screen or adding to it. `size` above one page is how a refresh after a
   * bulk action puts back the pages the owner had already loaded, in a single
   * request rather than one per page.
   */
  async function loadItems(page: number, mode: "replace" | "append", size = PAGE_SIZE) {
    const fetched = await menuApi.listItems(accessToken, websiteId, {
      categoryId: categoryFilter || undefined,
      search: search || undefined,
      page,
      size,
    });
    setItems((prev) => (mode === "replace" ? fetched.items : [...prev, ...fetched.items]));
    setTotal(fetched.total);
    setHasMore(fetched.hasMore);
    setLastPage(mode === "append" ? page : Math.ceil(size / PAGE_SIZE) - 1);
  }

  async function load() {
    setIsLoading(true);
    setError(null);
    try {
      if (showTrash) await loadTrash();
      else await loadItems(0, "replace");
      setSelected(new Set());
    } catch (err) {
      setError(friendlyMessage(err, "Failed to load menu items."));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMore() {
    setIsLoadingMore(true);
    setError(null);
    try {
      await loadItems(lastPage + 1, "append");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to load more items."));
    } finally {
      setIsLoadingMore(false);
    }
  }

  /**
   * After an action that changed the list, re-read exactly what the owner had
   * open. Past the server's cap we cannot ask for it all in one request, so
   * the list goes back to its first page rather than pretending otherwise.
   */
  async function refresh() {
    if (showTrash) {
      await loadTrash();
      setSelected(new Set());
      return;
    }
    const loadedRows = (lastPage + 1) * PAGE_SIZE;
    if (loadedRows <= SERVER_MAX_PAGE_SIZE) await loadItems(0, "replace", loadedRows);
    else await loadItems(0, "replace");
    setSelected(new Set());
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
      await refresh();
    } catch (err) {
      setError(friendlyMessage(err, "That action failed."));
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
              {categorySelectOptions(categories).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
            <TextField id="search" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Select
              id="availabilityFilter"
              label="Availability"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as "" | ItemAvailability)}
            >
              <option value="">All availability</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </Select>
            <Button className="w-auto px-4" onClick={load} isLoading={isLoading}>
              Apply
            </Button>
          </>
        )}
        <div className="ml-auto flex items-center gap-3">
          <Link href={`/manage/${websiteId}/menu/import`} className="text-sm font-medium hover:underline">
            Import CSV
          </Link>
          <Link href={`/manage/${websiteId}/menu/items/new`}>
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
            {categorySelectOptions(categories).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
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
        <p className="text-sm text-zinc-500">
          {showTrash ? "Trash is empty." : "You have not added any menu items yet. Use \"Add item\" above to add your first one."}
        </p>
      ) : visibleItems.length === 0 ? (
        <p className="text-sm text-zinc-500">
          {hasMore
            ? "None of the items loaded so far match the availability filter. Load more to keep looking."
            : "No items match the availability filter."}
        </p>
      ) : (
        <StaggerGroup as="ul" className="flex flex-col gap-2">
          {visibleItems.map((item) => (
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
                  <Link href={`/manage/${websiteId}/menu/items/${item.id}`} className="truncate font-medium hover:underline">
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

      {!isLoading && total > items.length && (
        <p className="text-sm text-zinc-500">
          Showing {items.length} of {total} items
        </p>
      )}

      {!isLoading && hasMore && (
        <Button variant="secondary" className="w-auto self-start px-4" onClick={loadMore} isLoading={isLoadingMore}>
          Show more
        </Button>
      )}
    </div>
  );
}
