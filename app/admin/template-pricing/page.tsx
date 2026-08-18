"use client";

import { useEffect, useMemo, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { adminApi } from "@/lib/api/admin";
import { friendlyMessage } from "@/lib/api/client";
import type { PlanCode, TemplatePriceResponse, TemplateType } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";
import { formatMoney } from "@/lib/format";
import { WEBSITE_TYPES, templateLabel } from "@/lib/website/layout-options";

/**
 * What each template costs.
 *
 * This is where an owner's bill is actually decided: they pick a template and a
 * billing period, and the price is this row - so two templates in the same
 * family can sensibly cost different amounts. The plan named here is the other
 * half of the same decision: it carries the limits the website gets, which is
 * why it sits on the row rather than being something the owner chooses.
 *
 * Repricing never touches a subscription that is already running. It applies
 * from the next checkout, which is said on the page rather than left to be
 * discovered.
 */

const PLAN_CODES: PlanCode[] = ["BASIC", "PREMIUM"];

interface Draft {
  monthlyPrice: string;
  yearlyPrice: string;
  planCode: PlanCode;
  active: boolean;
}

/** Client-side reading of the same rules the server enforces, so the message arrives before the request does. */
function draftProblem(draft: Draft): string | null {
  const monthly = Number(draft.monthlyPrice);
  const yearly = Number(draft.yearlyPrice);
  if (draft.monthlyPrice.trim() === "" || draft.yearlyPrice.trim() === "") {
    return "Both prices are needed - a template is priced monthly and yearly together.";
  }
  if (!Number.isFinite(monthly) || !Number.isFinite(yearly) || monthly < 0 || yearly < 0) {
    return "Prices must be numbers, and not negative.";
  }
  if (yearly < monthly) {
    return "A year cannot cost less than a month. Check the two figures.";
  }
  return null;
}

export default function AdminTemplatePricingPage() {
  const { session } = useAuth();
  const [prices, setPrices] = useState<TemplatePriceResponse[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);

  async function load() {
    if (!session) return;
    setPrices(await adminApi.listTemplatePrices(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(friendlyMessage(err, "Failed to load template pricing.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Grouped by family, so the comparison an admin is actually making - this
  // template against the one beside it - is the one the page puts side by side.
  const families = useMemo(
    () =>
      WEBSITE_TYPES.map((type) => ({
        type: type.value as TemplateType,
        label: type.label,
        rows: prices.filter((price) => price.templateType === type.value),
      })).filter((family) => family.rows.length > 0),
    [prices],
  );

  function startEdit(price: TemplatePriceResponse) {
    setMessage(null);
    setError(null);
    setEditing(price.layoutVariant);
    setDraft({
      monthlyPrice: String(price.monthlyPrice),
      yearlyPrice: String(price.yearlyPrice),
      planCode: price.planCode,
      active: price.active,
    });
  }

  function cancelEdit() {
    setEditing(null);
    setDraft(null);
    setError(null);
  }

  async function handleSave(price: TemplatePriceResponse) {
    if (!session || !draft) return;
    const problem = draftProblem(draft);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      await adminApi.updateTemplatePrice(session.accessToken, price.layoutVariant, {
        monthlyPrice: draft.monthlyPrice.trim(),
        yearlyPrice: draft.yearlyPrice.trim(),
        planCode: draft.planCode,
        active: draft.active,
      });
      cancelEdit();
      await load();
      setMessage(
        `${templateLabel(price.layoutVariant, price.templateType)} repriced. It applies from the next checkout - subscriptions already running keep what they paid for.`,
      );
    } catch (err) {
      setError(friendlyMessage(err, "Failed to update that price."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Template pricing</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          An owner picks a template, then monthly or yearly - the price is set here, per template. The plan on each row
          decides what that website is allowed to do; owners never see or choose it.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : families.length === 0 ? (
        <Alert tone="warning">
          No templates are priced yet. Until a template has a price, nobody can subscribe to a site using it.
        </Alert>
      ) : (
        families.map((family) => (
          <section key={family.type} className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              {family.label}
            </h2>
            <StaggerGroup className="grid gap-4 sm:grid-cols-2">
              {family.rows.map((price) => {
                const isEditing = editing === price.layoutVariant;
                const yearlySaving = price.monthlyPrice * 12 - price.yearlyPrice;
                return (
                  <StaggerItem key={price.id}>
                    <Card title={templateLabel(price.layoutVariant, price.templateType)}>
                      {isEditing && draft ? (
                        <div className="flex flex-col gap-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <TextField
                              id={`monthly-${price.id}`}
                              label="Monthly price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={draft.monthlyPrice}
                              onChange={(e) => setDraft({ ...draft, monthlyPrice: e.target.value })}
                            />
                            <TextField
                              id={`yearly-${price.id}`}
                              label="Yearly price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={draft.yearlyPrice}
                              onChange={(e) => setDraft({ ...draft, yearlyPrice: e.target.value })}
                            />
                          </div>

                          <fieldset className="flex flex-col gap-1.5">
                            <legend className="text-sm font-medium">What this template allows</legend>
                            <div className="flex gap-2">
                              {PLAN_CODES.map((code) => (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => setDraft({ ...draft, planCode: code })}
                                  className={`rounded-xl border px-4 py-2 text-sm transition-colors ${
                                    draft.planCode === code
                                      ? "border-[var(--accent-solid)] bg-[var(--accent-solid)]/8 font-medium"
                                      : "border-black/[.08] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.06]"
                                  }`}
                                >
                                  {code}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              The limits, analytics and multi-page rules come from this plan - set them under Plans.
                            </p>
                          </fieldset>

                          <Checkbox
                            id={`active-${price.id}`}
                            label="Available to subscribe to"
                            checked={draft.active}
                            onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
                          />
                          {!draft.active && (
                            <p className="ps-7 text-xs text-zinc-500 dark:text-zinc-400">
                              Turning this off stops new checkouts on this template. Sites already subscribed to it are
                              not affected.
                            </p>
                          )}

                          <div className="flex gap-2">
                            <Button className="!w-auto px-4" onClick={() => handleSave(price)} isLoading={isBusy}>
                              Save price
                            </Button>
                            <Button variant="secondary" className="!w-auto px-4" disabled={isBusy} onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
                            <div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">Monthly</p>
                              <p className="text-xl font-semibold tracking-tight">{formatMoney(price.monthlyPrice)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">Yearly</p>
                              <p className="text-xl font-semibold tracking-tight">{formatMoney(price.yearlyPrice)}</p>
                            </div>
                            {yearlySaving > 0 && (
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {formatMoney(yearlySaving)} less than twelve months
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge tone="neutral">{price.planCode} limits</Badge>
                            {price.active ? (
                              <Badge tone="success">Available</Badge>
                            ) : (
                              <Badge tone="warning">Not sold</Badge>
                            )}
                          </div>

                          <Button
                            variant="secondary"
                            className="!w-auto self-start px-4"
                            onClick={() => startEdit(price)}
                          >
                            Edit
                          </Button>
                        </div>
                      )}
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </section>
        ))
      )}
    </div>
  );
}
