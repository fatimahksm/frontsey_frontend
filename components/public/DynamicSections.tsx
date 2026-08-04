"use client";

import { SafeImage } from "@/components/public/SafeImage";
import { motion } from "framer-motion";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import type { PublicPageSection } from "@/lib/api/types";
import {
  parseSectionData,
  type AboutSectionData,
  type FaqSectionData,
  type TeamSectionData,
  type TestimonialsSectionData,
} from "@/lib/website/page-sections";

/**
 * Every layout design renders owner-added sections (About/Testimonials/FAQ/Team)
 * in its own visual language rather than one shared generic block - `tone`
 * picks which of the 6 designs' conventions to match.
 */
export type SectionTone = "hero" | "minimal" | "bold" | "classic" | "grid" | "elegant";

const HEADING_CLASS: Record<SectionTone, string> = {
  hero: "mb-10 text-center text-2xl font-bold tracking-tight text-white",
  minimal: "mb-6 text-sm font-semibold uppercase tracking-widest text-zinc-500",
  bold: "mb-8 flex items-center justify-center gap-3 text-2xl font-extrabold tracking-tight",
  classic: "mb-3 text-lg font-semibold tracking-tight",
  grid: "mb-4 text-xl font-semibold tracking-tight",
  elegant: "mb-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500",
};

const UNDERLINE_CLASS: Record<SectionTone, string> = {
  hero: "mx-auto mt-2 h-1 w-10 rounded-full bg-[var(--accent-solid)]",
  minimal: "",
  bold: "",
  classic: "",
  grid: "",
  elegant: "",
};

function Heading({ tone, children }: { tone: SectionTone; children: React.ReactNode }) {
  if (tone === "bold") {
    return (
      <h2 className={HEADING_CLASS[tone]}>
        <span className="h-3 w-3 rounded-full bg-gradient-accent" aria-hidden />
        {children}
      </h2>
    );
  }
  return (
    <h2 className={HEADING_CLASS[tone]}>
      {children}
      {UNDERLINE_CLASS[tone] && <span className={UNDERLINE_CLASS[tone]} />}
    </h2>
  );
}

const CONTAINER_CLASS: Record<SectionTone, string> = {
  hero: "px-6 py-20 sm:px-12",
  minimal: "mb-16",
  bold: "",
  classic: "",
  grid: "mt-16 rounded-2xl border border-black/[.08] p-6 dark:border-white/[.145]",
  elegant: "mt-14",
};

const WRAP_CLASS: Record<SectionTone, string> = {
  hero: "mx-auto w-full max-w-5xl",
  minimal: "",
  bold: "mb-16",
  classic: "",
  grid: "",
  elegant: "mx-auto max-w-2xl",
};

function AboutBlock({ tone, data }: { tone: SectionTone; data: AboutSectionData }) {
  const centered = tone === "bold" || tone === "elegant" || tone === "hero";
  return (
    <div className={centered ? "flex flex-col items-center text-center" : "flex flex-col gap-4 sm:flex-row sm:items-center"}>
      {data.imageUrl && (
        <SafeImage
          src={data.imageUrl}
          alt=""
          className={centered ? "mb-4 h-24 w-24 rounded-full object-cover shadow-soft" : "h-32 w-32 shrink-0 rounded-2xl object-cover shadow-soft"}
        />
      )}
      <p className={tone === "hero" ? "max-w-md text-zinc-400" : "max-w-xl text-sm text-zinc-500 dark:text-zinc-400"}>{data.body}</p>
    </div>
  );
}

function TestimonialsBlock({ tone, data }: { tone: SectionTone; data: TestimonialsSectionData }) {
  if (tone === "minimal" || tone === "elegant") {
    return (
      <StaggerGroup as="ul" className="flex flex-col divide-y divide-black/[.06] dark:divide-white/[.1]">
        {data.items.map((item, i) => (
          <StaggerItem as="li" key={i} className="flex flex-col gap-1 py-4">
            <p className="text-sm italic text-zinc-600 dark:text-zinc-400">&ldquo;{item.quote}&rdquo;</p>
            <p className="text-xs font-medium">{item.name}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    );
  }

  const cardClass =
    tone === "hero"
      ? "h-full rounded-2xl border border-white/10 bg-white/5 p-5"
      : tone === "bold"
        ? "h-full rounded-2xl border border-black/[.08] bg-surface p-5 shadow-soft dark:border-white/[.145]"
        : "h-full rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]";

  return (
    <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.items.map((item, i) => (
        <StaggerItem key={i}>
          <motion.div whileHover={{ y: -3 }} transition={{ duration: 0.2 }} className={cardClass}>
            <p className={`text-sm italic ${tone === "hero" ? "text-zinc-300" : "text-zinc-600 dark:text-zinc-400"}`}>
              &ldquo;{item.quote}&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              {item.imageUrl && (
                <SafeImage src={item.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              )}
              <p className="text-xs font-semibold">{item.name}</p>
            </div>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function FaqBlock({ tone, data }: { tone: SectionTone; data: FaqSectionData }) {
  const detailsClass =
    tone === "hero"
      ? "rounded-xl border border-white/10 bg-white/5 p-4"
      : "rounded-xl border border-black/[.08] p-4 dark:border-white/[.145]";
  const questionClass = tone === "hero" ? "cursor-pointer font-medium text-white" : "cursor-pointer font-medium";
  const answerClass = tone === "hero" ? "mt-2 text-sm text-zinc-400" : "mt-2 text-sm text-zinc-500 dark:text-zinc-400";

  return (
    <StaggerGroup className="flex flex-col gap-3">
      {data.items.map((item, i) => (
        <StaggerItem key={i}>
          <details className={detailsClass}>
            <summary className={questionClass}>{item.question}</summary>
            <p className={answerClass}>{item.answer}</p>
          </details>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

function TeamBlock({ tone, data }: { tone: SectionTone; data: TeamSectionData }) {
  return (
    <StaggerGroup className={`grid gap-6 ${tone === "elegant" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {data.items.map((item, i) => (
        <StaggerItem key={i}>
          <div className="flex flex-col items-center gap-2 text-center">
            {item.imageUrl ? (
              <SafeImage src={item.imageUrl} alt="" className="h-20 w-20 rounded-full object-cover shadow-soft" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-accent text-xl font-semibold text-white">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <p className={`text-sm font-semibold ${tone === "hero" ? "text-white" : ""}`}>{item.name}</p>
            <p className={`text-xs ${tone === "hero" ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"}`}>{item.role}</p>
          </div>
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}

export function DynamicSections({ sections, tone }: { sections: PublicPageSection[]; tone: SectionTone }) {
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section key={section.id} className={CONTAINER_CLASS[tone]}>
          <div className={WRAP_CLASS[tone]}>
            {section.type === "ABOUT" &&
              (() => {
                const data = parseSectionData<AboutSectionData>(section.data, "ABOUT");
                return (
                  <>
                    <Reveal>
                      <Heading tone={tone}>{data.heading}</Heading>
                    </Reveal>
                    <AboutBlock tone={tone} data={data} />
                  </>
                );
              })()}
            {section.type === "TESTIMONIALS" &&
              (() => {
                const data = parseSectionData<TestimonialsSectionData>(section.data, "TESTIMONIALS");
                return (
                  <>
                    <Reveal>
                      <Heading tone={tone}>{data.heading}</Heading>
                    </Reveal>
                    <TestimonialsBlock tone={tone} data={data} />
                  </>
                );
              })()}
            {section.type === "FAQ" &&
              (() => {
                const data = parseSectionData<FaqSectionData>(section.data, "FAQ");
                return (
                  <>
                    <Reveal>
                      <Heading tone={tone}>{data.heading}</Heading>
                    </Reveal>
                    <FaqBlock tone={tone} data={data} />
                  </>
                );
              })()}
            {section.type === "TEAM" &&
              (() => {
                const data = parseSectionData<TeamSectionData>(section.data, "TEAM");
                return (
                  <>
                    <Reveal>
                      <Heading tone={tone}>{data.heading}</Heading>
                    </Reveal>
                    <TeamBlock tone={tone} data={data} />
                  </>
                );
              })()}
          </div>
        </section>
      ))}
    </>
  );
}
