/**
 * Shared API contract types. These mirror the backend's DTOs (never its
 * JPA entities) so a change to the wire contract is a single, visible edit
 * here rather than something every page re-declares for itself.
 */

/** Matches com.dbwb.platform.common.dto.ApiResponse on the backend. */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

/** Matches com.dbwb.platform.account.entity.Role. */
export type Role = "SUPER_ADMIN" | "BUSINESS_OWNER" | "MANAGER";

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  accountId: string;
  email: string;
  role: Role;
}
