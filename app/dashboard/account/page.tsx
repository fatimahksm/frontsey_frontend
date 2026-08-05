"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { accountApi } from "@/lib/api/account";
import { friendlyMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-context";

export default function AccountPage() {
  const { session } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleExport() {
    if (!session) return;
    setError(null);
    setIsBusy(true);
    try {
      const data = await accountApi.exportData(session.accessToken);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "frontsey-account-data.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(friendlyMessage(err, "Failed to export your data."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleRequestDeletion() {
    if (!session) return;
    if (!window.confirm("This schedules your account for permanent deletion. Continue?")) return;
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      await accountApi.requestDeletion(session.accessToken);
      setMessage("Your account will be permanently deleted after the retention window unless you cancel.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to request deletion."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleCancelDeletion() {
    if (!session) return;
    setError(null);
    setMessage(null);
    setIsBusy(true);
    try {
      await accountApi.cancelDeletion(session.accessToken);
      setMessage("Account deletion cancelled.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to cancel deletion."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Account</h1>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <div className="flex flex-col gap-6">
        <Card title="Your data" description="Download a complete copy of your business data.">
          <Button className="w-auto px-5" onClick={handleExport} isLoading={isBusy}>
            Export my data
          </Button>
        </Card>

        <Card title="Delete account" description="Schedules permanent deletion after a retention window. You can cancel any time before then.">
          <div className="flex gap-3">
            <Button variant="secondary" className="w-auto px-5" onClick={handleRequestDeletion} isLoading={isBusy}>
              Request deletion
            </Button>
            <Button variant="secondary" className="w-auto px-5" onClick={handleCancelDeletion} isLoading={isBusy}>
              Cancel deletion
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
