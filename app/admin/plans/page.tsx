"use client";

import { useEffect, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { adminApi } from "@/lib/api/admin";
import { friendlyMessage } from "@/lib/api/client";
import type { PlanResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatMoney } from "@/lib/format";

export default function AdminPlansPage() {
  const { session } = useAuth();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<PlanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    if (!session) return;
    setPlans(await adminApi.listPlans(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(friendlyMessage(err, "Failed to load plans.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  function startEdit(plan: PlanResponse) {
    setEditingId(plan.id);
    setDraft({ ...plan });
  }

  async function handleSave() {
    if (!session || !editingId || !draft) return;
    setError(null);
    setIsBusy(true);
    try {
      await adminApi.updatePlan(session.accessToken, editingId, {
        price: String(draft.price),
        maxWebsites: draft.maxWebsites,
        maxManagersPerWebsite: draft.maxManagersPerWebsite,
        maxLanguages: draft.maxLanguages,
        maxGalleryImages: draft.maxGalleryImages,
        imageStorageLimitMb: draft.imageStorageLimitMb,
        analyticsEnabled: draft.analyticsEnabled,
        multiPageEnabled: draft.multiPageEnabled,
        active: true,
      });
      setEditingId(null);
      setDraft(null);
      await load();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to update plan."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Plans</h1>
      {error && <Alert tone="error">{error}</Alert>}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : (
        <StaggerGroup className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <StaggerItem key={plan.id}>
            <Card title={`${plan.code} · ${plan.billingPeriod}`}>
              {editingId === plan.id && draft ? (
                <div className="flex flex-col gap-3">
                  <TextField
                    id={`price-${plan.id}`}
                    label="Price"
                    type="number"
                    step="0.01"
                    value={String(draft.price)}
                    onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                  />
                  <TextField
                    id={`maxWebsites-${plan.id}`}
                    label="Max websites"
                    type="number"
                    value={String(draft.maxWebsites)}
                    onChange={(e) => setDraft({ ...draft, maxWebsites: Number(e.target.value) })}
                  />
                  <TextField
                    id={`maxManagers-${plan.id}`}
                    label="Max managers per website"
                    type="number"
                    value={String(draft.maxManagersPerWebsite)}
                    onChange={(e) => setDraft({ ...draft, maxManagersPerWebsite: Number(e.target.value) })}
                  />
                  <TextField
                    id={`maxLanguages-${plan.id}`}
                    label="Max languages"
                    type="number"
                    value={String(draft.maxLanguages)}
                    onChange={(e) => setDraft({ ...draft, maxLanguages: Number(e.target.value) })}
                  />
                  <TextField
                    id={`maxGallery-${plan.id}`}
                    label="Max gallery images"
                    type="number"
                    value={String(draft.maxGalleryImages)}
                    onChange={(e) => setDraft({ ...draft, maxGalleryImages: Number(e.target.value) })}
                  />
                  <TextField
                    id={`storage-${plan.id}`}
                    label="Image storage limit (MB)"
                    type="number"
                    value={String(draft.imageStorageLimitMb)}
                    onChange={(e) => setDraft({ ...draft, imageStorageLimitMb: Number(e.target.value) })}
                  />
                  <Checkbox
                    id={`analytics-${plan.id}`}
                    label="Analytics enabled"
                    checked={draft.analyticsEnabled}
                    onChange={(e) => setDraft({ ...draft, analyticsEnabled: e.target.checked })}
                  />
                  <Checkbox
                    id={`multiPage-${plan.id}`}
                    label="Multi-page enabled"
                    checked={draft.multiPageEnabled}
                    onChange={(e) => setDraft({ ...draft, multiPageEnabled: e.target.checked })}
                  />
                  <div className="flex gap-2">
                    <Button className="w-auto px-4" onClick={handleSave} isLoading={isBusy}>
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-auto px-4"
                      onClick={() => {
                        setEditingId(null);
                        setDraft(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1 text-sm">
                  <p className="text-lg font-semibold">{formatMoney(plan.price)}</p>
                  <p>Max websites: {plan.maxWebsites}</p>
                  <p>Max managers/website: {plan.maxManagersPerWebsite}</p>
                  <p>Max gallery images: {plan.maxGalleryImages}</p>
                  <p>Analytics: {plan.analyticsEnabled ? "Yes" : "No"}</p>
                  <p>Multi-page: {plan.multiPageEnabled ? "Yes" : "No"}</p>
                  <Button variant="secondary" className="mt-2 w-auto px-4" onClick={() => startEdit(plan)}>
                    Edit
                  </Button>
                </div>
              )}
            </Card>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
