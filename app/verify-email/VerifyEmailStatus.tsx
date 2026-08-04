"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { AuthCard } from "@/components/ui/AuthCard";
import { ApiError } from "@/lib/api/client";
import { authApi } from "@/lib/auth/api";

type Status = "verifying" | "success" | "error";

export function VerifyEmailStatus({ token }: { token: string | undefined }) {
  const [status, setStatus] = useState<Status>(() => (token ? "verifying" : "error"));
  const [message, setMessage] = useState<string | null>(() =>
    token ? null : "This verification link is missing its token.",
  );

  useEffect(() => {
    if (!token) return;

    authApi
      .verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof ApiError ? err.message : "Verification failed.");
      });
  }, [token]);

  return (
    <AuthCard title="Email verification" footer={{ linkLabel: "Log in", href: "/login" }}>
      {status === "verifying" && <Alert tone="info">Verifying your email…</Alert>}
      {status === "success" && (
        <Alert tone="success">Your email is verified. You can now log in.</Alert>
      )}
      {status === "error" && <Alert tone="error">{message}</Alert>}
    </AuthCard>
  );
}
