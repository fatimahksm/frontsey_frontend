"use client";

import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { CategoryManager } from "@/components/menu/CategoryManager";
import { ItemsPanel } from "@/components/menu/ItemsPanel";
import { ApiError } from "@/lib/api/client";
import { menuApi } from "@/lib/api/menu";
import type { CategoryDto } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

export default function MenuPage() {
  const { website, accessToken } = useWebsite();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function loadCategories() {
    try {
      setCategories(await menuApi.listCategories(accessToken, website.id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load categories.");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Menu</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Categories">
        <CategoryManager accessToken={accessToken} websiteId={website.id} categories={categories} onChange={loadCategories} />
      </Card>

      <Card title="Items">
        <ItemsPanel accessToken={accessToken} websiteId={website.id} currency={website.currency} categories={categories} />
      </Card>
    </div>
  );
}
