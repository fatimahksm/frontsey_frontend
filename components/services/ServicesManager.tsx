"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { servicesApi } from "@/lib/api/services";
import type { ServiceItemRequest, ServiceItemResponse } from "@/lib/api/types";
import { formatMoney } from "@/lib/format";
import { useWebsite } from "@/lib/website/website-context";

const EMPTY: ServiceItemRequest = { name: "", description: "", price: "", imageUrl: "" };

function moved<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

/**
 * Services management, shared by the "Services" dashboard tab and Step 4
 * (Add Content) of the guided creation wizard for Portfolio websites.
 */
export function ServicesManager() {
  const { website, accessToken } = useWebsite();
  const [services, setServices] = useState<ServiceItemResponse[]>([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<ServiceItemRequest>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    const list = await servicesApi.list(accessToken, website.id);
    setServices([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load services."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      const request: ServiceItemRequest = {
        name: draft.name.trim(),
        description: draft.description || null,
        price: draft.price || null,
        imageUrl: draft.imageUrl || null,
      };
      if (editingId) {
        await servicesApi.update(accessToken, website.id, editingId, request);
      } else {
        await servicesApi.create(accessToken, website.id, request);
      }
      setDraft(EMPTY);
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save service.");
    } finally {
      setIsBusy(false);
    }
  }

  function startEdit(service: ServiceItemResponse) {
    setEditingId(service.id);
    setDraft({
      name: service.name,
      description: service.description ?? "",
      price: service.price != null ? String(service.price) : "",
      imageUrl: service.imageUrl ?? "",
    });
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await servicesApi.delete(accessToken, website.id, id);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete service.");
    } finally {
      setIsBusy(false);
    }
  }

  const filteredServices = search.trim()
    ? services.filter((s) => {
        const q = search.trim().toLowerCase();
        return s.name.toLowerCase().includes(q) || (s.description ?? "").toLowerCase().includes(q);
      })
    : services;

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= services.length) return;
    const reordered = moved(services, index, target);
    setServices(reordered);
    setError(null);
    setIsBusy(true);
    try {
      await servicesApi.reorder(accessToken, website.id, reordered.map((s) => s.id));
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to reorder services.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Your services">
        {services.length > 0 && (
          <TextField id="serviceSearch" label="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="mb-4" />
        )}
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <StaggerGroup as="ul" className="flex flex-col gap-2">
            {filteredServices.map((service) => {
              const index = services.findIndex((s) => s.id === service.id);
              return (
                <StaggerItem as="li" key={service.id} className="flex items-center justify-between rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
                  <div className="min-w-0">
                    <p className="font-medium">{service.name}</p>
                    {service.description && <p className="text-xs text-zinc-500 dark:text-zinc-400">{service.description}</p>}
                    <p className="text-xs text-zinc-500">
                      {service.price != null ? formatMoney(service.price, website.currency) : "Priced on request"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <button type="button" disabled={index === 0} onClick={() => handleMove(index, -1)} className="disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === services.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button type="button" className="hover:underline" onClick={() => startEdit(service)}>
                      Edit
                    </button>
                    <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(service.id)}>
                      Delete
                    </button>
                  </div>
                </StaggerItem>
              );
            })}
            {services.length === 0 && (
              <p className="text-sm text-zinc-500">
                You have not added any services yet. Add your first service below.
              </p>
            )}
            {services.length > 0 && filteredServices.length === 0 && (
              <p className="text-sm text-zinc-500">No services match your search.</p>
            )}
          </StaggerGroup>
        )}
      </Card>

      <Card title={editingId ? "Edit service" : "Add a service"}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <TextField id="serviceName" label="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <Textarea
            id="serviceDescription"
            label="Description"
            value={draft.description ?? ""}
            onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id="servicePrice"
              label="Price (leave blank for 'on request')"
              type="number"
              step="0.01"
              min="0"
              value={draft.price ?? ""}
              onChange={(e) => setDraft({ ...draft, price: e.target.value })}
            />
            <ImageUploadField
              id="serviceImageUrl"
              label="Image"
              value={draft.imageUrl ?? ""}
              onChange={(url) => setDraft({ ...draft, imageUrl: url })}
              accessToken={accessToken}
            />
          </div>
          <div className="flex gap-3">
            <Button type="submit" isLoading={isBusy} className="w-auto px-5">
              {editingId ? "Save changes" : "Add service"}
            </Button>
            {editingId && (
              <Button
                type="button"
                variant="secondary"
                className="w-auto px-5"
                onClick={() => {
                  setEditingId(null);
                  setDraft(EMPTY);
                }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
