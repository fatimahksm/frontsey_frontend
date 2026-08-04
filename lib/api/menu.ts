import { apiFetch } from "@/lib/api/client";
import type {
  CategoryDeletionMode,
  CategoryDto,
  ItemAvailability,
  MenuItemRequest,
  MenuItemResponse,
} from "@/lib/api/types";

/** `/api/websites/{id}/menu/**` (BRD 9.6/9.9): categories, items, bulk actions. */
export const menuApi = {
  createCategory(accessToken: string, websiteId: string, name: string): Promise<CategoryDto> {
    return apiFetch<CategoryDto>(`/websites/${websiteId}/menu/categories`, {
      method: "POST",
      query: { name },
      accessToken,
    });
  },

  listCategories(accessToken: string, websiteId: string): Promise<CategoryDto[]> {
    return apiFetch<CategoryDto[]>(`/websites/${websiteId}/menu/categories`, { accessToken });
  },

  renameCategory(accessToken: string, websiteId: string, categoryId: string, name: string): Promise<CategoryDto> {
    return apiFetch<CategoryDto>(`/websites/${websiteId}/menu/categories/${categoryId}`, {
      method: "PUT",
      query: { name },
      accessToken,
    });
  },

  deleteCategory(
    accessToken: string,
    websiteId: string,
    categoryId: string,
    mode: CategoryDeletionMode,
    targetCategoryId?: string,
  ): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/menu/categories/${categoryId}`, {
      method: "DELETE",
      query: { mode, targetCategoryId },
      accessToken,
    });
  },

  createItem(accessToken: string, websiteId: string, request: MenuItemRequest): Promise<MenuItemResponse> {
    return apiFetch<MenuItemResponse>(`/websites/${websiteId}/menu/items`, {
      method: "POST",
      body: request,
      accessToken,
    });
  },

  updateItem(
    accessToken: string,
    websiteId: string,
    itemId: string,
    request: MenuItemRequest,
  ): Promise<MenuItemResponse> {
    return apiFetch<MenuItemResponse>(`/websites/${websiteId}/menu/items/${itemId}`, {
      method: "PUT",
      body: request,
      accessToken,
    });
  },

  duplicateItem(accessToken: string, websiteId: string, itemId: string): Promise<MenuItemResponse> {
    return apiFetch<MenuItemResponse>(`/websites/${websiteId}/menu/items/${itemId}/duplicate`, {
      method: "POST",
      accessToken,
    });
  },

  listItems(
    accessToken: string,
    websiteId: string,
    filters: { categoryId?: string; search?: string } = {},
  ): Promise<MenuItemResponse[]> {
    return apiFetch<MenuItemResponse[]>(`/websites/${websiteId}/menu/items`, {
      query: filters,
      accessToken,
    });
  },

  trashItem(accessToken: string, websiteId: string, itemId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/menu/items/${itemId}`, { method: "DELETE", accessToken });
  },

  listTrashedItems(accessToken: string, websiteId: string): Promise<MenuItemResponse[]> {
    return apiFetch<MenuItemResponse[]>(`/websites/${websiteId}/menu/items/trash`, { accessToken });
  },

  restoreItem(accessToken: string, websiteId: string, itemId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/menu/items/${itemId}/restore`, { method: "POST", accessToken });
  },

  setTemporaryUnavailability(
    accessToken: string,
    websiteId: string,
    itemId: string,
    until: string,
  ): Promise<MenuItemResponse> {
    return apiFetch<MenuItemResponse>(`/websites/${websiteId}/menu/items/${itemId}/temporary-unavailability`, {
      method: "PUT",
      query: { until },
      accessToken,
    });
  },

  bulkAvailability(
    accessToken: string,
    websiteId: string,
    itemIds: string[],
    availability: ItemAvailability,
  ): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/menu/items/bulk/availability`, {
      method: "POST",
      query: { itemIds: itemIds.join(","), availability },
      accessToken,
    });
  },

  bulkTrash(accessToken: string, websiteId: string, itemIds: string[]): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/menu/items/bulk/trash`, {
      method: "POST",
      query: { itemIds: itemIds.join(",") },
      accessToken,
    });
  },

  bulkMoveCategory(accessToken: string, websiteId: string, itemIds: string[], targetCategoryId: string): Promise<void> {
    return apiFetch<void>(`/websites/${websiteId}/menu/items/bulk/move-category`, {
      method: "POST",
      query: { itemIds: itemIds.join(","), targetCategoryId },
      accessToken,
    });
  },
};
