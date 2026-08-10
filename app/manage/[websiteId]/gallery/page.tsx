"use client";

import { useEffect, useRef, useState } from "react";

import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TextField } from "@/components/ui/TextField";
import { friendlyMessage } from "@/lib/api/client";
import { galleryApi } from "@/lib/api/gallery";
import type { GalleryImageResponse } from "@/lib/api/types";
import { uploadsApi } from "@/lib/api/uploads";
import { useWebsite } from "@/lib/website/website-context";

function moved<T>(list: T[], from: number, to: number): T[] {
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function GalleryPage() {
  const { website, accessToken, notifyDraftChanged } = useWebsite();
  const [images, setImages] = useState<GalleryImageResponse[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    const list = await galleryApi.list(accessToken, website.id);
    setImages([...list].sort((a, b) => a.sortOrder - b.sortOrder));
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount is a one-time sync with the backend, not derivable state
    load()
      .catch((err) => setError(friendlyMessage(err, "Failed to load the gallery.")))
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, website.id]);

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!imageUrl.trim()) return;
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.add(accessToken, website.id, imageUrl.trim());
      setImageUrl("");
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to add image."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleFileSelected(file: File) {
    setError(null);
    setIsUploading(true);
    try {
      const { url } = await uploadsApi.uploadImage(accessToken, file);
      await galleryApi.add(accessToken, website.id, url);
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to upload image."));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.delete(accessToken, website.id, id);
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to delete image."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleSetCover(id: string) {
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.setCover(accessToken, website.id, id);
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to set cover image."));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = moved(images, index, target);
    setImages(reordered);
    setError(null);
    setIsBusy(true);
    try {
      await galleryApi.reorder(accessToken, website.id, reordered.map((i) => i.id));
      await load();
      notifyDraftChanged();
    } catch (err) {
      setError(friendlyMessage(err, "Failed to reorder gallery."));
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Gallery</h1>
      {error && <Alert tone="error">{error}</Alert>}

      <Card title="Images">
        {isLoading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : (
          <StaggerGroup as="ul" className="grid gap-3 sm:grid-cols-2">
            {images.map((image, index) => (
              <StaggerItem
                as="li"
                key={image.id}
                className="overflow-hidden rounded-lg border border-black/[.08] shadow-soft transition-shadow duration-300 hover:shadow-lift dark:border-white/[.145]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- remote, owner-supplied URLs; next/image would need a configured remote pattern per business */}
                <img src={image.imageUrl} alt="" className="h-40 w-full object-cover" />
                <div className="flex items-center justify-between p-2 text-xs">
                  <div className="flex gap-2">
                    <button type="button" disabled={index === 0} onClick={() => handleMove(index, -1)} className="disabled:opacity-30">
                      ↑
                    </button>
                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetCover(image.id)}
                      className={image.cover ? "font-medium text-foreground" : "text-zinc-500 hover:underline"}
                    >
                      {image.cover ? "Cover" : "Set cover"}
                    </button>
                  </div>
                  <button type="button" className="text-red-600 hover:underline" onClick={() => handleDelete(image.id)}>
                    Delete
                  </button>
                </div>
              </StaggerItem>
            ))}
            {images.length === 0 && <p className="text-sm text-zinc-500">No images yet.</p>}
          </StaggerGroup>
        )}

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="secondary"
              className="w-auto px-4"
              isLoading={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload image
            </Button>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">or paste a URL below</span>
          </div>
          <form onSubmit={handleAdd} className="flex items-end gap-2">
            <TextField id="imageUrl" label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="flex-1" />
            <Button type="submit" isLoading={isBusy} className="w-auto px-5">
              Add image
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
