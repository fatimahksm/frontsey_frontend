"use client";

import { Select } from "@/components/ui/Select";
import {
  BUTTON_STYLE_LABELS,
  CARD_STYLE_LABELS,
  FONT_LABELS,
  SECTION_SPACING_LABELS,
  type ButtonStyle,
  type CardStyle,
  type FontChoice,
  type SectionSpacing,
  type ThemeConfig,
} from "@/lib/website/theme-config";

interface Props {
  config: ThemeConfig;
  onChange<K extends keyof ThemeConfig>(key: K, value: ThemeConfig[K]): void;
}

function ColorField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange(value: string): void }) {
  return (
    <label htmlFor={id} className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-9 shrink-0 cursor-pointer rounded border border-black/[.12] bg-transparent p-0.5 dark:border-white/[.18]"
        />
        <span className="font-mono text-xs uppercase text-zinc-500 dark:text-zinc-400">{value}</span>
      </div>
    </label>
  );
}

/**
 * Structured editor for ThemeConfig (Phase 3) - replaces the previous raw
 * JSON textarea so a Super Admin can never save arbitrary/invalid theme
 * data. Every field here maps 1:1 to the backend's validated schema.
 */
export function ThemeConfigForm({ config, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-black/[.12] p-4 dark:border-white/[.18]">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Design system</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField id="primaryColor" label="Primary color" value={config.primaryColor} onChange={(v) => onChange("primaryColor", v)} />
        <ColorField id="secondaryColor" label="Secondary color" value={config.secondaryColor} onChange={(v) => onChange("secondaryColor", v)} />
        <ColorField id="backgroundColor" label="Background color" value={config.backgroundColor} onChange={(v) => onChange("backgroundColor", v)} />
        <ColorField id="surfaceColor" label="Surface color" value={config.surfaceColor} onChange={(v) => onChange("surfaceColor", v)} />
        <ColorField id="textColor" label="Text color" value={config.textColor} onChange={(v) => onChange("textColor", v)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          id="fontFamily"
          label="Body font"
          value={config.fontFamily}
          onChange={(e) => onChange("fontFamily", e.target.value as FontChoice)}
        >
          {Object.entries(FONT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          id="headingFontFamily"
          label="Heading font"
          value={config.headingFontFamily}
          onChange={(e) => onChange("headingFontFamily", e.target.value as FontChoice)}
        >
          {Object.entries(FONT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          id="buttonStyle"
          label="Button style"
          value={config.buttonStyle}
          onChange={(e) => onChange("buttonStyle", e.target.value as ButtonStyle)}
        >
          {Object.entries(BUTTON_STYLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          id="cardStyle"
          label="Card style"
          value={config.cardStyle}
          onChange={(e) => onChange("cardStyle", e.target.value as CardStyle)}
        >
          {Object.entries(CARD_STYLE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select
          id="sectionSpacing"
          label="Section spacing"
          value={config.sectionSpacing}
          onChange={(e) => onChange("sectionSpacing", e.target.value as SectionSpacing)}
        >
          {Object.entries(SECTION_SPACING_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <label htmlFor="borderRadius" className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-foreground">Border radius ({config.borderRadius}px)</span>
          <input
            id="borderRadius"
            type="range"
            min={0}
            max={32}
            value={config.borderRadius}
            onChange={(e) => onChange("borderRadius", Number(e.target.value))}
            className="h-9"
          />
        </label>
      </div>
    </div>
  );
}
