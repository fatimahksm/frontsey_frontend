import { apiFetch } from "@/lib/api/client";
import type {
  PagedResponse,
  CategoryDeletionMode,
  CategoryDto,
  ItemAvailability,
  MenuItemRequest,
  MenuItemResponse,
} from "@/lib/api/types";

/** `/api/websites/{id}/menu/**` (BRD 9.6/9.9): categories, items, bulk actions. */
export const menuApi = {
  /** Omit `parentId` for a top-level category; pass one to create a sub-category under it. */
  createCategory(accessToken: string, websiteId: string, name: string, parentId?: string): Promise<CategoryDto> {
    return apiFetch<CategoryDto>(`/websites/${websiteId}/menu/categories`, {
      method: "POST",
      query: { name, parentId },
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

  /**
   * One page of items. The server caps `size`, so a caller asking for
   * everything gets a page and a total rather than everything.
   */
  listItems(
    accessToken: string,
    websiteId: string,
    filters: { categoryId?: string; search?: string; page?: number; size?: number } = {},
  ): Promise<PagedResponse<MenuItemResponse>> {
    return apiFetch<PagedResponse<MenuItemResponse>>(`/websites/${websiteId}/menu/items`, {
      query: filters,
      accessToken,
    });
  },

  /**
   * How many items the website has, without fetching them.
   *
   * Three screens wanted nothing but this number and got it by fetching every
   * item and reading .length - five hundred rows assembled, sent and parsed to
   * render "500". One row now, and the count comes from the page's own total.
   */
  countItems(accessToken: string, websiteId: string): Promise<number> {
    return menuApi.listItems(accessToken, websiteId, { size: 1 }).then((page) => page.total);
  },

  /** One item, by id - rather than fetching the whole list to find it. */
  getItem(accessToken: string, websiteId: string, itemId: string): Promise<MenuItemResponse> {
    return apiFetch<MenuItemResponse>(`/websites/${websiteId}/menu/items/${itemId}`, { accessToken });
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
