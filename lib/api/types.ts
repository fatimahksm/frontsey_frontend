/**
 * Shared API contract types. These mirror the backend's DTOs (never its
 * JPA entities) so a change to the wire contract is a single, visible edit
 * here rather than something every page re-declares for itself.
 */

import type { ThemeConfig } from "@/lib/website/theme-config";

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

export type AccountStatus =
  | "PENDING_VERIFICATION"
  | "ACTIVE"
  | "DISABLED_PENDING_DELETION"
  | "DELETED";

export type PageMode = "MULTI_PAGE" | "ONE_PAGE";
export type OrderingMode = "DISPLAY_ONLY" | "WHATSAPP_ORDERING";
/** The structural shape of a website - distinct from Theme, which is only visual styling. */
export type TemplateType = "MENU_ORDERING" | "PORTFOLIO";
/** Matches com.dbwb.platform.website.entity.LayoutVariant - a structural arrangement, orthogonal to Theme (colors only). */
export type LayoutVariant =
  | "MENU_CLASSIC"
  | "MENU_GRID"
  | "MENU_ELEGANT"
  | "MENU_BISTRO"
  | "PORTFOLIO_PROFESSIONAL"
  | "PORTFOLIO_VISUAL"
  | "PORTFOLIO_BRAND"
  | "PORTFOLIO_SERVICES";
export type WebsiteStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "SUSPENDED_TEMPORARY"
  | "SUSPENDED_PERMANENT"
  | "EXPIRED"
  | "TRASHED"
  | "DELETED";

/** Phase 4: the caller's relationship to a website. */
export type AccessRole = "OWNER" | "MANAGER";

export interface WebsiteResponse {
  id: string;
  businessName: string;
  slug: string;
  pageMode: PageMode;
  templateType: TemplateType;
  layoutVariant: LayoutVariant;
  orderingMode: OrderingMode;
  status: WebsiteStatus;
  primaryLanguage: string;
  currency: string;
  draftContent: string | null;
  publishedContent: string | null;
  publishedAt: string | null;
  themeId: string | null;
  /** This website's own theme overrides, or null when it inherits the selected preset. */
  themeConfig: string | null;
  /** Null on action-response endpoints that don't resolve it; always set on GET /websites/{id} and /websites/accessible. */
  role: AccessRole | null;
  /** For role="MANAGER", exactly the granted permissions; empty for role="OWNER" (an owner implicitly has all of them). */
  permissions: Permission[];
}

export interface CreateWebsiteRequest {
  businessName: string;
  pageMode: PageMode;
  templateType: TemplateType;
  themeId?: string | null;
}

export interface UpdateDraftContentRequest {
  content: string;
  orderingMode: OrderingMode;
}

export interface ThemeResponse {
  id: string;
  name: string;
  description: string | null;
  themeConfig: string | null;
}

export interface ThemeRequest {
  name: string;
  description?: string | null;
  themeConfig?: string | null;
  active: boolean;
}

export interface OpeningHoursEntry {
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  open: boolean;
  opensAt: string | null;
  closesAt: string | null;
}

export interface BusinessProfileRequest {
  description?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  phone?: string | null;
  whatsappNumber?: string | null;
  email?: string | null;
  address?: string | null;
  googleMapsUrl?: string | null;
  instagramUrl?: string | null;
  tiktokUrl?: string | null;
  showPrivacyPolicy: boolean;
  privacyPolicyContent?: string | null;
  showTermsAndConditions: boolean;
  termsAndConditionsContent?: string | null;
  showDeliveryPolicy: boolean;
  deliveryPolicyContent?: string | null;
  showRefundPolicy: boolean;
  refundPolicyContent?: string | null;
}

export type BusinessProfileResponse = BusinessProfileRequest;

export interface SeoMetadataRequest {
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImageUrl?: string | null;
}

export type SeoMetadataResponse = SeoMetadataRequest;

export interface DeliveryAreaResponse {
  id: string;
  name: string;
  deliveryFee: number;
  minimumOrderAmount: number;
  freeDeliveryThreshold: number | null;
}

export interface GalleryImageResponse {
  id: string;
  imageUrl: string;
  sortOrder: number;
  cover: boolean;
}

export type ItemAvailability = "AVAILABLE" | "UNAVAILABLE";

// --- Services (PORTFOLIO template) ---

/**
 * Create/update payload for a portfolio project.
 *
 * Only the name is required. Every template renders what is present and hides
 * what is not, so an owner can add a project with just a title and a picture
 * and come back to the detail later - which is the whole point of having this
 * editor instead of hand-written JSON in a custom section.
 */
export interface PortfolioProjectRequest {
  name: string;
  discipline?: string | null;
  year?: string | null;
  summary?: string | null;
  /** Comma-separated on the wire; the response splits it back into a list. */
  tags?: string | null;
  imageUrl?: string | null;
  liveUrl?: string | null;
  repoUrl?: string | null;
}

export interface PortfolioProjectResponse {
  id: string;
  name: string;
  discipline: string | null;
  year: string | null;
  summary: string | null;
  tags: string[];
  imageUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
  sortOrder: number;
}

export interface ServiceItemRequest {
  name: string;
  description?: string | null;
  price?: string | null; // null => priced on request
  imageUrl?: string | null;
}

export interface ServiceItemResponse {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  sortOrder: number;
}

/** The closed set of extra sections an owner can add on top of the fixed template content. */
export type PageSectionType = "ABOUT" | "TESTIMONIALS" | "FAQ" | "TEAM";

export interface PageSectionRequest {
  type: PageSectionType;
  /** Opaque JSON string; shape depends on `type` - see lib/website/page-sections.ts. */
  data: string;
}

export interface PageSectionResponse {
  id: string;
  type: PageSectionType;
  data: string;
  sortOrder: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  /** Null for a top-level category; set for a sub-category. Nesting is capped at one level. */
  parentId: string | null;
}

export type CategoryDeletionMode = "MOVE_ITEMS_TO_CATEGORY" | "DELETE_ITEMS" | "CANCEL";

export interface MenuItemRequest {
  categoryId: string;
  name: string;
  description?: string | null;
  ingredients?: string | null;
  price: string;
  discountPrice?: string | null;
  imageUrl?: string | null;
  maxOrderQuantity?: number | null;
  fixedBoxItem: boolean;
}

export interface MenuItemResponse {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  availability: ItemAvailability;
  unavailableUntil: string | null;
  maxOrderQuantity: number | null;
  fixedBoxItem: boolean;
}

export interface SizeVariantRequest {
  label: string;
  price: string;
}

export interface SizeVariantResponse {
  id: string;
  label: string;
  price: number;
}

export interface BoxVariantRequest {
  label: string;
  unitCount: number;
  price: string;
}

export interface BoxVariantResponse {
  id: string;
  label: string;
  unitCount: number;
  price: number;
}

export interface AddonRequest {
  name: string;
  extraPrice: string;
}

export interface AddonResponse {
  id: string;
  name: string;
  extraPrice: number;
}

export interface AddonGroupRequest {
  name: string;
  maxSelections?: number | null;
}

export interface AddonGroupResponse {
  id: string;
  name: string;
  maxSelections: number | null;
  addons: AddonResponse[];
}

export type ImportRowStatus = "VALID" | "INVALID" | "DUPLICATE";
export type DuplicateAction = "UPDATE" | "SKIP";

export interface ImportRowResult {
  rowNumber: number;
  categoryName: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number | null;
  discountPrice: number | null;
  imageUrl: string | null;
  maxOrderQuantity: number | null;
  status: ImportRowStatus;
  errors: string[];
  existingItemId: string | null;
}

export interface ImportPreviewResponse {
  totalRows: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  rows: ImportRowResult[];
}

export interface ImportRowDecision {
  rowNumber: number;
  action: DuplicateAction;
}

export interface ConfirmImportRequest {
  importValidRowsOnly: boolean;
  duplicateDecisions: ImportRowDecision[];
}

export interface ImportOutcomeResponse {
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  skippedRows: ImportRowResult[];
}

export type Permission =
  | "MANAGE_MENU"
  | "MANAGE_PRICES"
  | "MANAGE_THEME_AND_CONTENT"
  | "VIEW_ANALYTICS"
  | "PUBLISH_WEBSITE"
  | "MANAGE_BUSINESS_PROFILE"
  | "MANAGE_DELIVERY_SETTINGS";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "REVOKED" | "EXPIRED";

export interface InviteManagerRequest {
  email: string;
  permissions: Permission[];
}

export interface ManagerAccessResponse {
  id: string;
  invitedEmail: string;
  status: InvitationStatus;
  permissions: Permission[];
}

/** Phase 4: an invitation from the invited person's point of view - which website, not just the raw access-record fields. */
export interface ManagerInvitationResponse {
  id: string;
  websiteId: string;
  businessName: string;
  status: InvitationStatus;
  permissions: Permission[];
}

export type PlanCode = "BASIC" | "PREMIUM";
export type BillingPeriod = "MONTHLY" | "YEARLY";

export interface PlanResponse {
  id: string;
  code: PlanCode;
  billingPeriod: BillingPeriod;
  price: number;
  maxWebsites: number;
  maxManagersPerWebsite: number;
  maxLanguages: number;
  maxGalleryImages: number;
  imageStorageLimitMb: number;
  analyticsEnabled: boolean;
  multiPageEnabled: boolean;
}

export interface PlanUpdateRequest {
  price: string;
  maxWebsites: number;
  maxManagersPerWebsite: number;
  maxLanguages: number;
  maxGalleryImages: number;
  imageStorageLimitMb: number;
  analyticsEnabled: boolean;
  multiPageEnabled: boolean;
  active: boolean;
}

export type SubscriptionStatus = "PENDING" | "TRIAL" | "ACTIVE" | "GRACE" | "EXPIRED" | "CANCELED";
export type MockPaymentStatus = "PENDING" | "SUCCESS" | "FAILED";

export interface SubscriptionResponse {
  id: string;
  websiteId: string;
  planCode: string;
  billingPeriod: string;
  status: SubscriptionStatus;
  startDate: string | null;
  endDate: string | null;
  graceEndsAt: string | null;
  /** The server's own reading of BR-SUB-010: false while a paid plan is still running. */
  canChangePlan: boolean;
  /** Free access granted by a Super Admin: never billed, never expires. */
  complimentary: boolean;
}

/**
 * What a website costs is decided by its template, not by a tier the owner
 * picks - so checkout only asks how they want to be billed.
 */
export interface CheckoutRequest {
  billingPeriod: BillingPeriod;
}

/** One template's price, and the plan whose limits come with it. */
export interface TemplatePriceResponse {
  id: string;
  layoutVariant: LayoutVariant;
  templateType: TemplateType;
  monthlyPrice: number;
  yearlyPrice: number;
  planCode: PlanCode;
  active: boolean;
}

export interface TemplatePriceUpdateRequest {
  monthlyPrice: string;
  yearlyPrice: string;
  planCode: PlanCode;
  active: boolean;
}

export interface MockPaymentResponse {
  id: string;
  subscriptionId: string;
  amount: number;
  status: MockPaymentStatus;
  reference: string;
}

export type NotificationEvent =
  | "MANAGER_INVITATION"
  | "PAYMENT_FAILED"
  | "PAYMENT_SUCCESS"
  | "SUBSCRIPTION_EXPIRING"
  | "WEBSITE_PUBLISHED"
  | "WEBSITE_SUSPENDED";

export interface NotificationResponse {
  id: string;
  event: NotificationEvent;
  message: string;
  read: boolean;
  createdAt: string;
}

export type SupportCategory =
  | "ACCOUNT_ACCESS"
  | "BILLING_AND_SUBSCRIPTION"
  | "FEATURE_REQUEST"
  | "OTHER"
  | "TECHNICAL_ISSUE";
export type SupportTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface SubmitSupportTicketRequest {
  category: SupportCategory;
  subject: string;
  message: string;
  attachmentUrl?: string | null;
}

export interface SupportTicketResponse {
  id: string;
  category: SupportCategory;
  subject: string;
  message: string;
  attachmentUrl: string | null;
  status: SupportTicketStatus;
  createdAt: string;
}

export interface AccountDataExportResponse {
  accountEmail: string;
  exportedAt: string;
  websites: {
    website: WebsiteResponse;
    profile: BusinessProfileResponse;
    openingHours: OpeningHoursEntry[];
    categories: CategoryDto[];
    menuItems: MenuItemResponse[];
    deliveryAreas: DeliveryAreaResponse[];
  }[];
}

export interface AnalyticsSummaryResponse {
  from: string;
  to: string;
  totalVisits: number;
  mostViewedItems: { itemId: string; itemName: string; views: number }[];
  visitsByReferralSource: Record<string, number>;
  visitsByDeviceType: Record<string, number>;
  /** One entry per calendar day in the range, quiet days included, in order. */
  visitsByDay: { date: string; visits: number }[];
}

// --- Admin (Super Admin console) ---

export interface AccountSummaryResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  status: AccountStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface AdminWebsiteSummaryResponse {
  id: string;
  businessName: string;
  slug: string;
  status: WebsiteStatus;
  ownerId: string;
  ownerEmail: string;
  ownerName: string | null;
  /** From this website's own business profile - the number its customers use. */
  ownerPhone: string | null;
  /** How many websites this owner has in total. */
  ownerWebsiteCount: number;
  planCode: string | null;
  planBillingPeriod: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  /** Free access granted by an admin. */
  complimentary: boolean;
  subscriptionEndsAt: string | null;
  suspensionReason: string | null;
  suspensionReactivateAt: string | null;
  publishedAt: string | null;
}

export interface SuspendWebsiteRequest {
  reason: string;
  permanent: boolean;
  reactivateAt?: string | null;
}

export interface AdminDashboardResponse {
  totalUsers: number;
  totalWebsites: number;
  activeSubscriptions: number;
  pendingPayments: number;
  subscriptionsExpiringSoon: number;
  totalRevenue: number;
}

// --- Public storefront ---

export interface PublicSizeOption {
  id: string;
  label: string;
  price: number;
}

export interface PublicAddonOption {
  id: string;
  name: string;
  extraPrice: number;
}

export interface PublicAddonGroupOption {
  id: string;
  name: string;
  maxSelections: number | null;
  options: PublicAddonOption[];
}

export interface PublicBoxOption {
  id: string;
  label: string;
  unitCount: number;
  price: number;
}

export interface PublicMenuItem {
  id: string;
  name: string;
  description: string | null;
  ingredients: string | null;
  price: number;
  discountPrice: number | null;
  imageUrl: string | null;
  availability: ItemAvailability;
  maxOrderQuantity: number | null;
  fixedBoxItem: boolean;
  sizes: PublicSizeOption[];
  addonGroups: PublicAddonGroupOption[];
  boxVariants: PublicBoxOption[];
}

export interface PublicCategory {
  id: string;
  name: string;
  items: PublicMenuItem[];
  /** One level only - a sub-category's own `subcategories` is always empty. */
  subcategories: PublicCategory[];
}

export interface PublicDeliveryArea {
  id: string;
  name: string;
  fee: number;
  minimumOrder: number;
  freeThreshold: number | null;
}

export interface PublicOpeningHours {
  dayOfWeek: string;
  open: boolean;
  opensAt: string | null;
  closesAt: string | null;
}

export interface PublicProfile {
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  email: string | null;
  address: string | null;
  googleMapsUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  policies: Record<string, string>;
}

export interface PublicSeoMetadata {
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
}

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
}

export interface PublicWebsiteResponse {
  businessName: string;
  slug: string;
  pageMode: PageMode;
  templateType: TemplateType;
  layoutVariant: LayoutVariant;
  orderingMode: OrderingMode;
  primaryLanguage: string;
  currency: string;
  publishedContent: string | null;
  profile: PublicProfile | null;
  openingHours: PublicOpeningHours[];
  categories: PublicCategory[];
  deliveryAreas: PublicDeliveryArea[];
  /** Populated only for TemplateType.PORTFOLIO sites; empty for MENU_ORDERING. */
  services: PublicService[];
  galleryImageUrls: string[];
  seo: PublicSeoMetadata | null;
  /** Owner-added extra sections (About/Testimonials/FAQ/Team), in display order. */
  sections: PublicPageSection[];
  /** Phase 3: the website's effective design system - see lib/website/theme-config.ts. */
  theme: ThemeConfig;
  /**
   * Portfolio projects, in the owner's order. Empty for MENU_ORDERING sites and
   * for portfolio sites that predate the projects editor - templates fall back
   * to the gallery in that case, so an older saved site is unaffected.
   */
  projects: PublicProject[];
}

/** One portfolio project as the public site sees it. Every field but the name may be blank. */
export interface PublicProject {
  id: string;
  name: string;
  discipline: string | null;
  year: string | null;
  summary: string | null;
  tags: string[];
  imageUrl: string | null;
  liveUrl: string | null;
  repoUrl: string | null;
}

export interface PublicPageSection {
  id: string;
  type: PageSectionType;
  data: string;
}

/** BR-QR-003/004: distinguishes "doesn't exist" from "suspended" without ever exposing the internal WebsiteStatus/reason. */
export type PublicWebsiteStatus = "AVAILABLE" | "NOT_FOUND" | "UNAVAILABLE";

export interface PublicWebsiteEnvelope {
  status: PublicWebsiteStatus;
  website: PublicWebsiteResponse | null;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

export interface AdminWebsiteUpdateRequest {
  businessName: string;
}

export interface AuditLogResponse {
  id: string;
  actorAccountId: string;
  actorEmail: string | null;
  action: string;
  targetId: string | null;
  createdAt: string;
}

/** Matches com.dbwb.platform.ai.dto.AiSuggestionFieldType. */
export type AiSuggestionFieldType =
  | "HERO_HEADING"
  | "HERO_SUBTITLE"
  | "BUSINESS_DESCRIPTION"
  | "SEO_META_TITLE"
  | "SEO_META_DESCRIPTION";

export interface AiSuggestionRequest {
  businessName: string;
  templateType?: TemplateType | null;
  fieldType: AiSuggestionFieldType;
  existingText?: string | null;
}

export interface AiSuggestionResponse {
  suggestion: string;
}

/** Matches com.dbwb.platform.admin.dto.AdminPlatformReportResponse. */
export interface AdminPlatformReportResponse {
  days: number;
  templates: { layoutVariant: LayoutVariant; templateType: TemplateType; websites: number; published: number }[];
  signups: { date: string; count: number }[];
  websitesCreated: { date: string; count: number }[];
  websitesPublished: { date: string; count: number }[];
  revenue: { date: string; amount: number }[];
  subscriptions: { status: SubscriptionStatus; count: number }[];
  revenueByPlan: { planCode: string; billingPeriod: string; payments: number; revenue: number }[];
  firstPayments: number;
  renewals: number;
  onFreeTrial: number;
  trialsLapsed: number;
}

/** Matches com.dbwb.platform.admin.dto.ProvisionWebsiteRequest. */
export interface ProvisionWebsiteRequest {
  ownerEmail: string;
  ownerFullName?: string | null;
  businessName: string;
  templateType: TemplateType;
  layoutVariant?: LayoutVariant | null;
  pageMode?: PageMode | null;
  complimentary: boolean;
}

/** Matches com.dbwb.platform.admin.dto.ProvisionedWebsiteResponse. */
export interface ProvisionedWebsiteResponse {
  websiteId: string;
  businessName: string;
  slug: string;
  ownerId: string;
  ownerEmail: string;
  ownerAccountCreated: boolean;
  complimentary: boolean;
}
