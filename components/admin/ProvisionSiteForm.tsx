"use client";

import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { TextField } from "@/components/ui/TextField";
import { adminApi } from "@/lib/api/admin";
import { friendlyMessage } from "@/lib/api/client";
import type { ProvisionedWebsiteResponse, TemplateType } from "@/lib/api/types";
import { WEBSITE_TYPES } from "@/lib/website/layout-options";

/**
 * Setting a website up on somebody else's behalf.
 *
 * Distinct from an owner creating their own: the person here is named by email
 * and may not have an account yet. The admin never picks their password - one
 * unusable value is stored and the owner is invited to choose their own, which
 * also verifies their address, so they sign in once rather than chasing two
 * emails.
 *
 * "Free access" grants exactly that rather than faking a payment: the site
 * publishes, never expires, and the owner is never asked for money.
 */
export function ProvisionSiteForm({ accessToken, onCreated }: { accessToken: string; onCreated(): void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerFullName, setOwnerFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [templateType, setTemplateType] = useState<TemplateType>("MENU_ORDERING");
  const [complimentary, setComplimentary] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<ProvisionedWebsiteResponse | null>(null);

  function reset() {
    setOwnerEmail("");
    setOwnerFullName("");
    setBusinessName("");
    setTemplateType("MENU_ORDERING");
    setComplimentary(false);
    setError(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setDone(null);
    setIsSubmitting(true);
    try {
      const result = await adminApi.provisionWebsite(accessToken, {
        ownerEmail: ownerEmail.trim(),
        ownerFullName: ownerFullName.trim() || null,
        businessName: businessName.trim(),
        templateType,
        complimentary,
      });
      setDone(result);
      reset();
      // Close back to the summary - the confirmation lives there, and leaving an
      // empty form open reads as "nothing happened" after a successful create.
      setIsOpen(false);
      onCreated();
    } catch (err) {
      setError(friendlyMessage(err, "Could not set that website up."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) {
    return (
      <div className="flex flex-col gap-3">
        {done && (
          <Alert tone="success">
            <span className="font-medium">{done.businessName}</span> is set up for {done.ownerEmail}
            {done.ownerAccountCreated
              ? " - an account was created and they have been emailed a link to choose a password."
              : " - added to their existing account."}
            {done.complimentary && " It has free access, so they will never be asked to pay."}
          </Alert>
        )}
        <Button className="!w-auto self-start px-4" variant="secondary" onClick={() => setIsOpen(true)}>
          Set up a site for an owner
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-black/[.08] bg-surface p-5 shadow-soft dark:border-white/[.12]"
    >
      <div>
        <h2 className="text-sm font-semibold tracking-tight">Set up a site for an owner</h2>
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          They will own it. If this email has no account yet, one is created and they are emailed a link to choose
          their own password - you never set it.
        </p>
      </div>

      {error && <Alert tone="error">{error}</Alert>}

      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          id="ownerEmail"
          label="Owner's email"
          type="email"
          required
          autoComplete="off"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
        />
        <TextField
          id="ownerFullName"
          label="Owner's name (optional)"
          value={ownerFullName}
          onChange={(e) => setOwnerFullName(e.target.value)}
        />
      </div>

      <TextField
        id="provisionBusinessName"
        label="Business name"
        required
        value={businessName}
        onChange={(e) => setBusinessName(e.target.value)}
      />

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Kind of website</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {WEBSITE_TYPES.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTemplateType(option.value)}
              className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                templateType === option.value
                  ? "border-[var(--accent-solid)] bg-[var(--accent-solid)]/8"
                  : "border-black/[.08] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:bg-white/[.04]"
              }`}
            >
              <span className="font-medium">{option.label}</span>
              <span className="mt-0.5 block text-xs text-zinc-500 dark:text-zinc-400">{option.description}</span>
            </button>
          ))}
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          The owner picks the exact template and colours themselves, in their own setup.
        </p>
      </fieldset>

      <div className="rounded-xl bg-black/[.03] p-3 dark:bg-white/[.05]">
        <Checkbox
          id="complimentary"
          label="Free access - never billed, never expires"
          checked={complimentary}
          onChange={(e) => setComplimentary(e.target.checked)}
        />
        <p className="mt-1 ps-7 text-xs text-zinc-500 dark:text-zinc-400">
          {complimentary
            ? "This site publishes and stays live without a subscription. The owner is never shown a plan or asked to pay."
            : "Leave off and this site behaves like any other - it gets the same free trial at its first publish."}
        </p>
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="!w-auto px-5" isLoading={isSubmitting} disabled={!ownerEmail.trim() || !businessName.trim()}>
          Create the site
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="!w-auto px-4"
          disabled={isSubmitting}
          onClick={() => {
            setIsOpen(false);
            reset();
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
