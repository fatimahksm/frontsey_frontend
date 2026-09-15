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
import { buildCategoryTree, categorySelectOptions } from "@/lib/menu/category-tree";

interface Props {
  accessToken: string;
  websiteId: string;
  categories: CategoryDto[];
  onChange(): void;
}

/**
 * BR-MENU-012: deleting a category with items requires the Owner to
 * explicitly choose what happens to them. Categories nest one level deep
 * (Coffee -> Hot / Iced); deleting a parent takes its sub-categories with it,
 * so the single choice below covers every item underneath.
 */
export function CategoryManager({ accessToken, websiteId, categories, onChange }: Props) {
  const [newName, setNewName] = useState("");
  const [addingSubTo, setAddingSubTo] = useState<{ parentId: string; name: string } | null>(null);
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletionMode, setDeletionMode] = useState<CategoryDeletionMode>("DELETE_ITEMS");
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const tree = buildCategoryTree(categories);

  /** Runs one category mutation, surfacing failures and refreshing the list on success. */
  async function run(action: () => Promise<unknown>, failureMessage: string, onDone: () => void) {
    setError(null);
    setIsBusy(true);
    try {
      await action();
      onDone();
      onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : failureMessage);
    } finally {
      setIsBusy(false);
    }
  }

  function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    if (!newName.trim()) return;
    void run(() => menuApi.createCategory(accessToken, websiteId, newName.trim()), "Failed to create category.", () =>
      setNewName(""),
    );
  }

  function handleCreateSubcategory(event: React.FormEvent) {
    event.preventDefault();
    if (!addingSubTo?.name.trim()) return;
    const { parentId, name } = addingSubTo;
    void run(
      () => menuApi.createCategory(accessToken, websiteId, name.trim(), parentId),
      "Failed to create sub-category.",
      () => setAddingSubTo(null),
    );
  }

  function handleRename(id: string) {
    if (!renaming?.name.trim()) return;
    const name = renaming.name.trim();
    void run(() => menuApi.renameCategory(accessToken, websiteId, id, name), "Failed to rename category.", () =>
      setRenaming(null),
    );
  }

  function handleDelete(id: string) {
    void run(
      () =>
        menuApi.deleteCategory(
          accessToken,
          websiteId,
          id,
          deletionMode,
          deletionMode === "MOVE_ITEMS_TO_CATEGORY" ? targetCategoryId : undefined,
        ),
      "Failed to delete category.",
      () => setDeleting(null),
    );
  }

  /**
   * One category's name and its Rename/Delete controls - identical for
   * top-level categories and sub-categories, so both render through here.
   *
   * Deliberately a render helper called as a function rather than a nested
   * `<Component />`: a component declared inside this one is a new type on
   * every render, which would remount the rename input and drop focus after
   * each keystroke.
   */
  function categoryRow(category: CategoryDto, extraAction?: React.ReactNode) {
    if (renaming?.id === category.id) {
      return (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={renaming.name}
            onChange={(e) => setRenaming({ id: category.id, name: e.target.value })}
            className="h-9 flex-1 rounded-lg border border-line-strong bg-transparent px-2.5 text-sm outline-none"
          />
          <Button onClick={() => handleRename(category.id)} isLoading={isBusy}>
            Save
          </Button>
          <Button variant="secondary" onClick={() => setRenaming(null)}>
            Cancel
          </Button>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium">{category.name}</span>
        <div className="flex items-center gap-2 text-xs">
          {extraAction}
          <button
            type="button"
            className="text-muted hover:underline"
            onClick={() => setRenaming({ id: category.id, name: category.name })}
          >
            Rename
          </button>
          <button type="button" className="text-red-600 hover:underline" onClick={() => setDeleting(category.id)}>
            Delete
          </button>
        </div>
      </div>
    );
  }

  /**
   * BR-MENU-012 confirmation. `alsoRemoves` lists sub-categories that go with
   * a parent, which are both announced to the Owner and kept out of the
   * "move items to" choices - they will not exist after the delete.
   * A render helper, for the same reason as {@link categoryRow}.
   */
  function deletionPanel(category: CategoryDto, alsoRemoves: CategoryDto[]) {
    const removedIds = new Set([category.id, ...alsoRemoves.map((sub) => sub.id)]);
    return (
      <div className="mt-3 flex flex-col gap-2 rounded-lg bg-black/[.03] p-3 dark:bg-white/[.05]">
        {alsoRemoves.length > 0 && (
          <p className="text-xs text-muted">
            This also deletes its {alsoRemoves.length} sub-{alsoRemoves.length === 1 ? "category" : "categories"} (
            {alsoRemoves.map((sub) => sub.name).join(", ")}). Your choice below applies to every item in them.
          </p>
        )}
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
            {categorySelectOptions(categories)
              .filter((option) => !removedIds.has(option.id))
              .map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
          </Select>
        )}
        <div className="flex gap-2">
          <Button
 
            onClick={() => handleDelete(category.id)}
            isLoading={isBusy}
            disabled={deletionMode === "MOVE_ITEMS_TO_CATEGORY" && !targetCategoryId}
          >
            Confirm delete
          </Button>
          <Button variant="secondary" onClick={() => setDeleting(null)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert tone="error">{error}</Alert>}

      <StaggerGroup as="ul" className="flex flex-col gap-2">
        {tree.map(({ category, subcategories }) => (
          <StaggerItem as="li" key={category.id} className="rounded-lg border border-line p-3">
            {categoryRow(
              category,
              <button
                type="button"
                className="text-muted hover:underline"
                onClick={() => setAddingSubTo({ parentId: category.id, name: "" })}
              >
                + Sub-category
              </button>,
            )}

            {subcategories.length > 0 && (
              <ul className="mt-2 flex flex-col gap-1.5 border-l border-line pl-3">
                {subcategories.map((sub) => (
                  <li key={sub.id}>
                    {categoryRow(sub)}
                    {deleting === sub.id && deletionPanel(sub, [])}
                  </li>
                ))}
              </ul>
            )}

            {addingSubTo?.parentId === category.id && (
              <form onSubmit={handleCreateSubcategory} className="mt-3 flex items-end gap-2">
                <TextField
                  id={`new-subcategory-${category.id}`}
                  label={`New sub-category in ${category.name}`}
                  value={addingSubTo.name}
                  onChange={(e) => setAddingSubTo({ parentId: category.id, name: e.target.value })}
                />
                <Button type="submit" isLoading={isBusy} >
                  Add
                </Button>
                <Button variant="secondary" onClick={() => setAddingSubTo(null)}>
                  Cancel
                </Button>
              </form>
            )}

            {deleting === category.id && deletionPanel(category, subcategories)}
          </StaggerItem>
        ))}
        {categories.length === 0 && <p className="text-sm text-muted">No categories yet.</p>}
      </StaggerGroup>

      {/* Secondary: this page's one primary action is Add item, in the toolbar
          above. Two gradients on a screen means neither is the answer to
          "what am I here to do". */}
      <form onSubmit={handleCreate} className="flex items-end gap-2">
        <TextField
          id="newCategory"
          label="New category"
          wrapperClassName="flex-1"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <Button type="submit" variant="secondary" isLoading={isBusy}>
          Add
        </Button>
      </form>
    </div>
  );
}
