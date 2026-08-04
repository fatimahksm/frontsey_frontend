"use client";

import { useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { ApiError } from "@/lib/api/client";
import { menuImportApi } from "@/lib/api/menuImport";
import type { DuplicateAction, ImportOutcomeResponse, ImportPreviewResponse } from "@/lib/api/types";
import { useWebsite } from "@/lib/website/website-context";

const STATUS_TONE = { VALID: "success", INVALID: "danger", DUPLICATE: "warning" } as const;

export default function MenuImportPage() {
  const { website, accessToken } = useWebsite();

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [decisions, setDecisions] = useState<Record<number, DuplicateAction>>({});
  const [importValidRowsOnly, setImportValidRowsOnly] = useState(false);
  const [outcome, setOutcome] = useState<ImportOutcomeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handlePreview() {
    if (!file) return;
    setError(null);
    setOutcome(null);
    setIsBusy(true);
    try {
      const result = await menuImportApi.preview(accessToken, website.id, file);
      setPreview(result);
      setDecisions({});
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to preview the file.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleConfirm() {
    if (!file) return;
    setError(null);
    setIsBusy(true);
    try {
      const result = await menuImportApi.confirm(accessToken, website.id, file, {
        importValidRowsOnly,
        duplicateDecisions: Object.entries(decisions).map(([rowNumber, action]) => ({
          rowNumber: Number(rowNumber),
          action,
        })),
      });
      setOutcome(result);
      setPreview(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to complete the import.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold tracking-tight">Import menu from CSV</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Columns: Category, Name, Description, Ingredients, Price, DiscountPrice, ImageUrl, MaxOrderQuantity.
      </p>

      {error && <Alert tone="error">{error}</Alert>}

      <Card title="1. Choose file">
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <Button className="w-auto px-4" onClick={handlePreview} isLoading={isBusy} disabled={!file}>
            Preview
          </Button>
        </div>
      </Card>

      {preview && (
        <Card
          title="2. Review"
          description={`${preview.totalRows} rows · ${preview.validCount} valid · ${preview.duplicateCount} duplicate · ${preview.invalidCount} invalid`}
        >
          <div className="flex flex-col gap-3">
            <ul className="flex flex-col gap-2">
              {preview.rows.map((row) => (
                <li key={row.rowNumber} className="rounded-lg border border-black/[.08] p-3 text-sm dark:border-white/[.145]">
                  <div className="flex items-center justify-between">
                    <span>
                      Row {row.rowNumber}: {row.name || "(no name)"} · {row.categoryName}
                    </span>
                    <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                  </div>
                  {row.errors.length > 0 && (
                    <p className="mt-1 text-xs text-red-600">{row.errors.join(" ")}</p>
                  )}
                  {row.status === "DUPLICATE" && (
                    <div className="mt-2">
                      <Select
                        id={`decision-${row.rowNumber}`}
                        label="What should happen to this duplicate?"
                        value={decisions[row.rowNumber] ?? ""}
                        onChange={(e) =>
                          setDecisions((prev) => ({ ...prev, [row.rowNumber]: e.target.value as DuplicateAction }))
                        }
                      >
                        <option value="">Skip (default)</option>
                        <option value="UPDATE">Update existing item</option>
                        <option value="SKIP">Skip</option>
                      </Select>
                    </div>
                  )}
                </li>
              ))}
            </ul>

            {preview.invalidCount > 0 && (
              <Checkbox
                id="importValidRowsOnly"
                label="Import valid rows only (skip invalid rows instead of cancelling the whole import)"
                checked={importValidRowsOnly}
                onChange={(e) => setImportValidRowsOnly(e.target.checked)}
              />
            )}

            <Button
              onClick={handleConfirm}
              isLoading={isBusy}
              className="w-auto px-5"
              disabled={preview.invalidCount > 0 && !importValidRowsOnly}
            >
              Confirm import
            </Button>
          </div>
        </Card>
      )}

      {outcome && (
        <Card title="Import complete">
          <p className="text-sm">
            {outcome.createdCount} created · {outcome.updatedCount} updated · {outcome.skippedCount} skipped
          </p>
          {outcome.skippedRows.length > 0 && (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-zinc-500">
              {outcome.skippedRows.map((row) => (
                <li key={row.rowNumber}>
                  Row {row.rowNumber}: {row.name} - {row.errors.join(" ") || "skipped"}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
