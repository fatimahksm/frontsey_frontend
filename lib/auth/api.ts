import { apiFetch } from "@/lib/api/client";
import type { AuthResponse, LoginRequest, RegisterRequest } from "@/lib/api/types";

/** All calls against the backend's `/api/auth/**` module (BRD 9.1). */
export const authApi = {
  register(request: RegisterRequest): Promise<void> {
    return apiFetch<void>("/auth/register", { method: "POST", body: request });
  },

  verifyEmail(token: string): Promise<void> {
    return apiFetch<void>("/auth/verify-email", { method: "POST", query: { token } });
  },

  login(request: LoginRequest): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/login", { method: "POST", body: request });
  },

  requestPasswordReset(email: string): Promise<void> {
    return apiFetch<void>("/auth/password-reset/request", { method: "POST", query: { email } });
  },

  confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    return apiFetch<void>("/auth/password-reset/confirm", {
      method: "POST",
      query: { token, newPassword },
    });
  },
};
