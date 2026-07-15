"use client";

import { useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import type { CategoryDeletionMode, CategoryDto } from "@/lib/api/types";

interface Props {
  accessToken: string;
  websiteId: string;
  categories: CategoryDto[];
  onChange(): void;
}

/** BR-MENU-012: deleting a category with items requires the Owner to explicitly choose what happens to them. */
export function CategoryManager({ accessToken, websiteId, categories, onChange }: Props) {
  const [newName, setNewName] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletionMode, setDeletionMode] = useState<CategoryDeletionMode>("DELETE_ITEMS");
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await menuApi.createCategory(accessToken, websiteId, newName.trim());
      setNewName("");
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create category.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRename(id: string) {
    if (!renaming || !renaming.name.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await menuApi.renameCategory(accessToken, websiteId, id, renaming.name.trim());
      setRenaming(null);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to rename category.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await menuApi.deleteCategory(
        accessToken,
        websiteId,
        id,
        deletionMode,
        deletionMode === "MOVE_ITEMS_TO_CATEGORY" ? targetCategoryId : undefined,
      );
      setDeleting(null);
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete category.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="error">{error}</Alert>}

      <StaggerGroup as="ul" className="flex flex-col gap-2">
        {categories.map((category) => (
          <StaggerItem as="li" key={category.id} className="rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
            {renaming?.id === category.id ? (
              <div className="flex items-center gap-2">
                <input
                  value={renaming.name}
                  onChange={(e) => setRenaming({ id: category.id, name: e.target.value })}
                  className="h-9 flex-1 rounded-lg border border-black/[.12] bg-transparent px-2.5 text-sm outline-none dark:border-white/[.18]"
                />
                <Button className="w-auto px-3" onClick={() => handleRename(category.id)} isLoading={isBusy}>
                  Save
                </Button>
                <Button variant="secondary" className="w-auto px-3" onClick={() => setRenaming(null)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.name}</span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    className="text-zinc-500 hover:underline"
                    onClick={() => setRenaming({ id: category.id, name: category.name })}
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    className="text-red-600 hover:underline"
                    onClick={() => setDeleting(category.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {deleting === category.id && (
              <div className="mt-3 flex flex-col gap-2 rounded-lg bg-black/[.03] p-3 dark:bg-white/[.05]">
                <Select
                  id={`deletion-mode-${category.id}`}
                  label="What should happen to items in this category?"
                  value={deletionMode}
                  onChange={(e) => setDeletionMode(e.target.value as CategoryDeletionMode)}
                >
                  <option value="DELETE_ITEMS">Delete the items too</option>
                  <option value="MOVE_ITEMS_TO_CATEGORY">Move items to another category</option>
                </Select>
                {deletionMode === "MOVE_ITEMS_TO_CATEGORY" && (
                  <Select
                    id={`target-category-${category.id}`}
                    label="Target category"
                    value={targetCategoryId}
                    onChange={(e) => setTargetCategoryId(e.target.value)}
                  >
                    <option value="">Choose a category…</option>
                    {categories
                      .filter((c) => c.id !== category.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </Select>
                )}
                <div className="flex gap-2">
                  <Button
                    className="w-auto px-3"
                    onClick={() => handleDelete(category.id)}
                    isLoading={isBusy}
                    disabled={deletionMode === "MOVE_ITEMS_TO_CATEGORY" && !targetCategoryId}
                  >
                    Confirm delete
                  </Button>
                  <Button variant="secondary" className="w-auto px-3" onClick={() => setDeleting(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </StaggerItem>
        ))}
        {categories.length === 0 && <p className="text-sm text-zinc-500">No categories yet.</p>}
      </StaggerGroup>

      <form onSubmit={handleCreate} className="flex items-end gap-2">
        <TextField id="newCategory" label="New category" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button type="submit" isLoading={isBusy} className="w-auto px-4">
          Add
        </Button>
      </form>
    </div>
  );
}
