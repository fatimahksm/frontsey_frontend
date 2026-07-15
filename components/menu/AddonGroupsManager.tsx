"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { ApiError } from "@/lib/api/client";
import { menuOptionsApi } from "@/lib/api/menuOptions";
import type { AddonGroupResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";

export function AddonGroupsManager({
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
  const [groups, setGroups] = useState<AddonGroupResponse[]>([]);
  const [groupName, setGroupName] = useState("");
  const [maxSelections, setMaxSelections] = useState("");
  const [addonDrafts, setAddonDrafts] = useState<Record<string, { name: string; extraPrice: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    setGroups(await menuOptionsApi.listAddonGroups(accessToken, websiteId, itemId));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, websiteId, itemId]);

  async function handleAddGroup(event: React.FormEvent) {
    event.preventDefault();
    if (!groupName.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.addAddonGroup(accessToken, websiteId, itemId, {
        name: groupName.trim(),
        maxSelections: maxSelections ? Number(maxSelections) : null,
      });
      setGroupName("");
      setMaxSelections("");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add add-on group.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDeleteGroup(groupId: string) {
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.deleteAddonGroup(accessToken, websiteId, itemId, groupId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete add-on group.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleAddAddon(groupId: string) {
    const draft = addonDrafts[groupId];
    if (!draft?.name.trim() || !draft.extraPrice) return;
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.addAddon(accessToken, websiteId, itemId, groupId, {
        name: draft.name.trim(),
        extraPrice: draft.extraPrice,
      });
      setAddonDrafts((prev) => ({ ...prev, [groupId]: { name: "", extraPrice: "" } }));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to add add-on.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleDeleteAddon(groupId: string, addonId: string) {
    setError(null);
    setIsBusy(true);
    try {
      await menuOptionsApi.deleteAddon(accessToken, websiteId, itemId, groupId, addonId);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete add-on.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert tone="error">{error}</Alert>}

      {groups.map((group) => (
        <div key={group.id} className="rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {group.name}
              {group.maxSelections != null && (
                <span className="ml-2 text-xs font-normal text-zinc-500">max {group.maxSelections}</span>
              )}
            </span>
            <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => handleDeleteGroup(group.id)}>
              Remove group
            </button>
          </div>

          <ul className="mt-2 flex flex-col gap-1">
            {group.addons.map((addon) => (
              <li key={addon.id} className="flex items-center justify-between text-sm">
                <span>
                  {addon.name} · +{formatMoney(addon.extraPrice, currency)}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline"
                  onClick={() => handleDeleteAddon(group.id, addon.id)}
                >
                  Remove
                </button>
              </li>
            ))}
            {group.addons.length === 0 && <p className="text-sm text-zinc-500">No add-ons in this group yet.</p>}
          </ul>

          <div className="mt-2 flex items-end gap-2">
            <TextField
              id={`addonName-${group.id}`}
              label="Add-on name"
              value={addonDrafts[group.id]?.name ?? ""}
              onChange={(e) =>
                setAddonDrafts((prev) => ({ ...prev, [group.id]: { name: e.target.value, extraPrice: prev[group.id]?.extraPrice ?? "" } }))
              }
            />
            <TextField
              id={`addonPrice-${group.id}`}
              label="Extra price"
              type="number"
              step="0.01"
              min="0"
              value={addonDrafts[group.id]?.extraPrice ?? ""}
              onChange={(e) =>
                setAddonDrafts((prev) => ({ ...prev, [group.id]: { name: prev[group.id]?.name ?? "", extraPrice: e.target.value } }))
              }
            />
            <Button className="w-auto px-3" onClick={() => handleAddAddon(group.id)} isLoading={isBusy}>
              Add
            </Button>
          </div>
        </div>
      ))}

      <form onSubmit={handleAddGroup} className="flex items-end gap-2">
        <TextField id="groupName" label="New add-on group" value={groupName} onChange={(e) => setGroupName(e.target.value)} />
        <TextField
          id="maxSelections"
          label="Max selections (optional)"
          type="number"
          min="1"
          value={maxSelections}
          onChange={(e) => setMaxSelections(e.target.value)}
        />
        <Button type="submit" isLoading={isBusy} className="w-auto px-4">
          Add group
        </Button>
      </form>
    </div>
  );
}
