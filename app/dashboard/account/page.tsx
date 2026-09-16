"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageFrame } from "@/components/ui/PageFrame";
import { TextField } from "@/components/ui/TextField";
import { accountApi } from "@/lib/api/account";
import { friendlyMessage } from "@/lib/api/client";
import type { AccountProfileResponse } from "@/lib/api/types";
import { useAuth } from "@/lib/auth/auth-context";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Platform admin",
  BUSINESS_OWNER: "Business owner",
  MANAGER: "Manager",
};

/**
 * Your account.
 *
 * It used to offer to export and permanently delete an account it never
 * named: no email, no role, no way to change your own password, and nothing
 * that told you which of your accounts you were signed in as. A settings page
 * that cannot answer "who am I?" is not a settings page.
 */
export default function AccountPage() {
  const { session } = useAuth();
  const [profile, setProfile] = useState<AccountProfileResponse | null>(null);
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    accountApi
      .me(session.accessToken)
      .then((found) => {
        if (cancelled) return;
        setProfile(found);
        setFullName(found.fullName ?? "");
      })
      .catch((err) => {
        if (!cancelled) setError(friendlyMessage(err, "Failed to load your account."));
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  async function handleSaveName(event: React.FormEvent) {
    event.preventDefault();
    if (!session || !fullName.trim()) return;
    setError(null);
    setMessage(null);
    setIsSavingName(true);
    try {
      setProfile(await accountApi.updateProfile(session.accessToken, { fullName: fullName.trim() }));
      setMessage("Your details were saved.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to save your details."));
    } finally {
      setIsSavingName(false);
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!session) return;
    setError(null);
    setMessage(null);
    setIsChangingPassword(true);
    try {
      await accountApi.changePassword(session.accessToken, { currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setMessage("Your password was changed. We have emailed you to confirm.");
    } catch (err) {
      setError(friendlyMessage(err, "Failed to change your password."));
    } finally {
      setIsChangingPassword(false);
    }
  }

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
    <PageFrame width="form">
      <h1 className="mb-6 text-xl font-semibold tracking-tight">Account</h1>

      {error && <Alert tone="error">{error}</Alert>}
      {message && <Alert tone="success">{message}</Alert>}

      <div className="flex flex-col gap-6">
        <Card title="Who you are signed in as">
          {profile === null ? (
            <p className="text-sm text-muted">Loading…</p>
          ) : (
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
                <div className="min-w-0">
                  <dt className="text-xs text-muted">Email</dt>
                  <dd className="mt-0.5 flex flex-wrap items-center gap-2 break-words">
                    {profile.email}
                    {profile.emailVerified ? (
                      <Badge tone="success">Verified</Badge>
                    ) : (
                      <Badge tone="warning">Not verified</Badge>
                    )}
                  </dd>
                  {/* Deliberately not editable here: the email is the login and
                      the address every reset is sent to, so changing it needs
                      confirming at the new address rather than a text field a
                      typo can lock you out of. */}
                  <p className="mt-1 text-xs text-muted">Contact support to change your email.</p>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-muted">Role</dt>
                  <dd className="mt-0.5">{ROLE_LABELS[profile.role] ?? profile.role}</dd>
                </div>
                <div className="min-w-0">
                  <dt className="text-xs text-muted">Member since</dt>
                  <dd className="mt-0.5">
                    {new Date(profile.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              </dl>

              <form onSubmit={handleSaveName} className="flex flex-wrap items-end gap-3 border-t border-line pt-4">
                <TextField
                  id="fullName"
                  label="Your name"
                  wrapperClassName="min-w-48 flex-1"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Button type="submit" variant="secondary" isLoading={isSavingName} disabled={!fullName.trim()}>
                  Save
                </Button>
              </form>
            </div>
          )}
        </Card>

        {profile?.disabledAt && (
          <Alert tone="warning">
            This account is scheduled for deletion. Cancel below to keep it.
          </Alert>
        )}

        <Card
          title="Password"
          description="You need your current password to set a new one, so a signed-in browser somebody else finds is not enough to take your account."
        >
          <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="currentPassword"
                label="Current password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <TextField
                id="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                hint="At least 8 characters."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex">
              <Button
                type="submit"
                isLoading={isChangingPassword}
                disabled={!currentPassword || newPassword.length < 8}
              >
                Change password
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Your data" description="Download a complete copy of your business data.">
          <Button variant="secondary" onClick={handleExport} isLoading={isBusy}>
            Export my data
          </Button>
        </Card>

        <Card title="Delete account" description="Schedules permanent deletion after a retention window. You can cancel any time before then.">
          <div className="flex flex-wrap gap-3">
            <Button variant="danger" onClick={handleRequestDeletion} isLoading={isBusy}>
              Request deletion
            </Button>
            <Button variant="secondary" onClick={handleCancelDeletion} isLoading={isBusy}>
              Cancel deletion
            </Button>
          </div>
        </Card>
      </div>
    </PageFrame>
  );
}
