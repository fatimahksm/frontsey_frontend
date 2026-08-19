import { apiFetch } from "@/lib/api/client";
import type {
  ProvisionWebsiteRequest,
  ProvisionedWebsiteResponse,
  AdminPlatformReportResponse,
  AccountSummaryResponse,
  AdminDashboardResponse,
  AdminWebsiteSummaryResponse,
  AdminWebsiteUpdateRequest,
  AuditLogResponse,
  LayoutVariant,
  PlanResponse,
  PlanUpdateRequest,
  TemplatePriceResponse,
  TemplatePriceUpdateRequest,
  SupportTicketResponse,
  SupportTicketStatus,
  SuspendWebsiteRequest,
  ThemeRequest,
  ThemeResponse,
  UpdateUserRoleRequest,
  WebsiteResponse,
} from "@/lib/api/types";

/** `/api/admin/**` (BRD 9.17): Super Admin console only. */
export const adminApi = {
  /** Stand a website up for an owner named by email (Super Admin). */
  provisionWebsite(accessToken: string, body: ProvisionWebsiteRequest): Promise<ProvisionedWebsiteResponse> {
    return apiFetch<ProvisionedWebsiteResponse>("/admin/websites/provision", { method: "POST", accessToken, body });
  },

  /** The platform report - templates chosen, signups, publishes, takings, renewals. */
  report(accessToken: string, days = 30): Promise<AdminPlatformReportResponse> {
    return apiFetch<AdminPlatformReportResponse>(`/admin/report?days=${days}`, { accessToken });
  },

  dashboard(accessToken: string): Promise<AdminDashboardResponse> {
    return apiFetch<AdminDashboardResponse>("/admin/dashboard", { accessToken });
  },

  listUsers(accessToken: string): Promise<AccountSummaryResponse[]> {
    return apiFetch<AccountSummaryResponse[]>("/admin/users", { accessToken });
  },

  updateUserRole(accessToken: string, accountId: string, request: UpdateUserRoleRequest): Promise<AccountSummaryResponse> {
    return apiFetch<AccountSummaryResponse>(`/admin/users/${accountId}/role`, { method: "PUT", body: request, accessToken });
  },

  disableUser(accessToken: string, accountId: string): Promise<AccountSummaryResponse> {
    return apiFetch<AccountSummaryResponse>(`/admin/users/${accountId}/disable`, { method: "POST", accessToken });
  },

  reactivateUser(accessToken: string, accountId: string): Promise<AccountSummaryResponse> {
    return apiFetch<AccountSummaryResponse>(`/admin/users/${accountId}/reactivate`, { method: "POST", accessToken });
  },

  listWebsites(accessToken: string): Promise<AdminWebsiteSummaryResponse[]> {
    return apiFetch<AdminWebsiteSummaryResponse[]>("/admin/websites", { accessToken });
  },

  updateWebsite(accessToken: string, websiteId: string, request: AdminWebsiteUpdateRequest): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/admin/websites/${websiteId}`, { method: "PUT", body: request, accessToken });
  },

  deleteWebsite(accessToken: string, websiteId: string): Promise<void> {
    return apiFetch<void>(`/admin/websites/${websiteId}`, { method: "DELETE", accessToken });
  },

  suspendWebsite(accessToken: string, websiteId: string, request: SuspendWebsiteRequest): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/admin/websites/${websiteId}/suspend`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  reactivateWebsite(accessToken: string, websiteId: string): Promise<WebsiteResponse> {
    return apiFetch<WebsiteResponse>(`/admin/websites/${websiteId}/reactivate`, { method: "POST", accessToken });
  },

  listThemes(accessToken: string): Promise<ThemeResponse[]> {
    return apiFetch<ThemeResponse[]>("/admin/themes", { accessToken });
  },

  createTheme(accessToken: string, request: ThemeRequest): Promise<ThemeResponse> {
    return apiFetch<ThemeResponse>("/admin/themes", { method: "POST", body: request, accessToken });
  },

  updateTheme(accessToken: string, themeId: string, request: ThemeRequest): Promise<ThemeResponse> {
    return apiFetch<ThemeResponse>(`/admin/themes/${themeId}`, { method: "PUT", body: request, accessToken });
  },

  deleteTheme(accessToken: string, themeId: string): Promise<void> {
    return apiFetch<void>(`/admin/themes/${themeId}`, { method: "DELETE", accessToken });
  },

  listPlans(accessToken: string): Promise<PlanResponse[]> {
    return apiFetch<PlanResponse[]>("/admin/plans", { accessToken });
  },

  updatePlan(accessToken: string, planId: string, request: PlanUpdateRequest): Promise<PlanResponse> {
    return apiFetch<PlanResponse>(`/admin/plans/${planId}`, { method: "PUT", body: request, accessToken });
  },

  /** Every template's price, monthly and yearly. */
  listTemplatePrices(accessToken: string): Promise<TemplatePriceResponse[]> {
    return apiFetch<TemplatePriceResponse[]>("/admin/template-prices", { accessToken });
  },

  /** Reprice one template. Subscriptions already running keep what they paid for. */
  updateTemplatePrice(
    accessToken: string,
    layoutVariant: LayoutVariant,
    request: TemplatePriceUpdateRequest,
  ): Promise<TemplatePriceResponse> {
    return apiFetch<TemplatePriceResponse>(`/admin/template-prices/${layoutVariant}`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  listSupportTickets(accessToken: string): Promise<SupportTicketResponse[]> {
    return apiFetch<SupportTicketResponse[]>("/admin/support-tickets", { accessToken });
  },

  updateSupportTicketStatus(
    accessToken: string,
    ticketId: string,
    status: SupportTicketStatus,
  ): Promise<SupportTicketResponse> {
    return apiFetch<SupportTicketResponse>(`/admin/support-tickets/${ticketId}/status`, {
      method: "PUT",
      query: { status },
      accessToken,
    });
  },

  listAuditLogs(accessToken: string): Promise<AuditLogResponse[]> {
    return apiFetch<AuditLogResponse[]>("/admin/audit-log", { accessToken });
  },
};
