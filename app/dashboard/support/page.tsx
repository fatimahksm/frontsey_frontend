"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { TextField } from "@/components/ui/TextField";
import { Textarea } from "@/components/ui/Textarea";
import { ApiError } from "@/lib/api/client";
import { supportApi } from "@/lib/api/support";
import type { SupportCategory, SupportTicketResponse } from "@/lib/api/types";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/lib/auth/auth-context";

const STATUS_TONE = { OPEN: "warning", IN_PROGRESS: "neutral", RESOLVED: "success" } as const;

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: "ACCOUNT_ACCESS", label: "Account access" },
  { value: "BILLING_AND_SUBSCRIPTION", label: "Billing & subscription" },
  { value: "TECHNICAL_ISSUE", label: "Technical issue" },
  { value: "FEATURE_REQUEST", label: "Feature request" },
  { value: "OTHER", label: "Other" },
];

export default function SupportPage() {
  const { session } = useAuth();
  const [tickets, setTickets] = useState<SupportTicketResponse[]>([]);
  const [category, setCategory] = useState<SupportCategory>("OTHER");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    if (!session) return;
    setTickets(await supportApi.listMine(session.accessToken));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load your support tickets."))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!session || !subject.trim() || !message.trim()) return;
    setError(null);
    setConfirmation(null);
    setIsSubmitting(true);
    try {
      await supportApi.submit(session.accessToken, {
        category,
        subject: subject.trim(),
        message: message.trim(),
        attachmentUrl: attachmentUrl || null,
      });
      setSubject("");
      setMessage("");
      setAttachmentUrl("");
      setConfirmation("Your ticket was submitted. We'll get back to you soon.");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Support</h1>

      {error && <Alert tone="error">{error}</Alert>}
      {confirmation && <Alert tone="success">{confirmation}</Alert>}

      <Card title="Submit a ticket">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select id="category" label="Category" value={category} onChange={(e) => setCategory(e.target.value as SupportCategory)}>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
          <TextField id="subject" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <Textarea id="message" label="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <TextField
            id="attachmentUrl"
            label="Attachment URL (optional)"
            value={attachmentUrl}
            onChange={(e) => setAttachmentUrl(e.target.value)}
          />
          <Button type="submit" isLoading={isSubmitting} className="w-auto px-5">
            Submit ticket
          </Button>
        </form>
      </Card>

      <h2 className="mt-8 mb-3 text-sm font-semibold">Your tickets</h2>
      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : tickets.length === 0 ? (
        <p className="text-sm text-zinc-500">No tickets yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tickets.map((ticket) => (
            <li key={ticket.id} className="rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
              <div className="flex items-center justify-between">
                <span className="font-medium">{ticket.subject}</span>
                <Badge tone={STATUS_TONE[ticket.status]}>{ticket.status.replace("_", " ")}</Badge>
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">{ticket.message}</p>
              <p className="mt-1 text-xs text-zinc-500">{formatDateTime(ticket.createdAt)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
