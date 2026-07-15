import { apiFetch } from "@/lib/api/client";
import type {
  AddonGroupRequest,
  AddonGroupResponse,
  AddonRequest,
  AddonResponse,
  BoxVariantRequest,
  BoxVariantResponse,
  SizeVariantRequest,
  SizeVariantResponse,
} from "@/lib/api/types";

const base = (websiteId: string, itemId: string) => `/websites/${websiteId}/menu/items/${itemId}`;

/** `/api/websites/{id}/menu/items/{itemId}/**` (BRD 9.7): sizes, add-ons, fixed-box variants. */
export const menuOptionsApi = {
  listSizes(accessToken: string, websiteId: string, itemId: string): Promise<SizeVariantResponse[]> {
    return apiFetch<SizeVariantResponse[]>(`${base(websiteId, itemId)}/sizes`, { accessToken });
  },
  addSize(accessToken: string, websiteId: string, itemId: string, request: SizeVariantRequest): Promise<SizeVariantResponse> {
    return apiFetch<SizeVariantResponse>(`${base(websiteId, itemId)}/sizes`, { method: "POST", body: request, accessToken });
  },
  deleteSize(accessToken: string, websiteId: string, itemId: string, sizeId: string): Promise<void> {
    return apiFetch<void>(`${base(websiteId, itemId)}/sizes/${sizeId}`, { method: "DELETE", accessToken });
  },

  listAddonGroups(accessToken: string, websiteId: string, itemId: string): Promise<AddonGroupResponse[]> {
    return apiFetch<AddonGroupResponse[]>(`${base(websiteId, itemId)}/addon-groups`, { accessToken });
  },
  addAddonGroup(
    accessToken: string,
    websiteId: string,
    itemId: string,
    request: AddonGroupRequest,
  ): Promise<AddonGroupResponse> {
    return apiFetch<AddonGroupResponse>(`${base(websiteId, itemId)}/addon-groups`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },
  deleteAddonGroup(accessToken: string, websiteId: string, itemId: string, groupId: string): Promise<void> {
    return apiFetch<void>(`${base(websiteId, itemId)}/addon-groups/${groupId}`, { method: "DELETE", accessToken });
  },
  addAddon(
    accessToken: string,
    websiteId: string,
    itemId: string,
    groupId: string,
    request: AddonRequest,
  ): Promise<AddonResponse> {
    return apiFetch<AddonResponse>(`${base(websiteId, itemId)}/addon-groups/${groupId}/addons`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },
  deleteAddon(accessToken: string, websiteId: string, itemId: string, groupId: string, addonId: string): Promise<void> {
    return apiFetch<void>(`${base(websiteId, itemId)}/addon-groups/${groupId}/addons/${addonId}`, {
      method: "DELETE",
      accessToken,
    });
  },

  listBoxVariants(accessToken: string, websiteId: string, itemId: string): Promise<BoxVariantResponse[]> {
    return apiFetch<BoxVariantResponse[]>(`${base(websiteId, itemId)}/box-variants`, { accessToken });
  },
  addBoxVariant(
    accessToken: string,
    websiteId: string,
    itemId: string,
    request: BoxVariantRequest,
  ): Promise<BoxVariantResponse> {
    return apiFetch<BoxVariantResponse>(`${base(websiteId, itemId)}/box-variants`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },
  deleteBoxVariant(accessToken: string, websiteId: string, itemId: string, variantId: string): Promise<void> {
    return apiFetch<void>(`${base(websiteId, itemId)}/box-variants/${variantId}`, { method: "DELETE", accessToken });
  },
};
