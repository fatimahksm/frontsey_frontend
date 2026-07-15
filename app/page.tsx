"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";
import { Button } from "@/components/ui/Button";
import { fadeInUp } from "@/lib/motion";
import { useAuth } from "@/lib/auth/auth-context";

const FEATURES = [
  {
    title: "Menu & ordering",
    description: "Categories, sizes, add-ons, box combos, and a WhatsApp cart - built for cafes, restaurants, and shops.",
    icon: "🍽️",
  },
  {
    title: "Portfolio sites",
    description: "A clean services showcase for salons, studios, freelancers, and agencies - no cart needed.",
    icon: "✨",
  },
  {
    title: "WhatsApp checkout",
    description: "Customers build their order and send it straight to your WhatsApp - no payment integration required.",
    icon: "💬",
  },
  {
    title: "Live in minutes",
    description: "Pick a template, fill in your business, subscribe, publish. Your site is live at its own address.",
    icon: "🚀",
  },
];

const STEPS = [
  { step: "01", title: "Create your site", description: "Choose Menu & Ordering or Portfolio, name your business." },
  { step: "02", title: "Add your content", description: "Menu items, services, gallery, hours, contact info - all in one dashboard." },
  { step: "03", title: "Publish & share", description: "Subscribe, publish, and share your link. Customers order via WhatsApp." },
];

export default function Home() {
  const { session, isLoading } = useAuth();

  return (
    <main className="flex flex-1 flex-col overflow-x-hidden">
      <section className="relative flex flex-col items-center justify-center gap-6 px-4 py-32 text-center sm:py-40">
        <div
          aria-hidden
          className="animate-float absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gradient-accent opacity-20 blur-3xl"
        />
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-full border border-black/[.08] bg-surface px-4 py-1.5 text-xs font-medium text-zinc-500 shadow-soft dark:border-white/[.1] dark:text-zinc-400"
        >
          Multi-tenant website builder
        </motion.span>
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="relative max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl"
        >
          Build your business website <span className="text-gradient">in minutes.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative max-w-xl text-lg text-zinc-600 dark:text-zinc-400"
        >
          Pick a template, brand your site, and share it with customers - no code required.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative flex flex-col gap-3 sm:flex-row"
        >
          {isLoading ? null : session ? (
            <Link href="/dashboard" className="w-full sm:w-48">
              <Button>Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/register" className="w-full sm:w-48">
                <Button>Get started</Button>
              </Link>
              <Link href="/login" className="w-full sm:w-48">
                <Button variant="secondary">Log in</Button>
              </Link>
            </>
          )}
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-20">
        <Reveal className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Everything your business needs</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">Two ways to launch, one dashboard to run it all.</p>
        </Reveal>
        <StaggerGroup className="grid gap-5 sm:grid-cols-2">
          {FEATURES.map((feature) => (
            <StaggerItem
              key={feature.title}
              className="rounded-2xl border border-black/[.08] bg-surface p-6 shadow-soft transition-shadow duration-300 hover:shadow-lift dark:border-white/[.1]"
            >
              <span className="text-3xl">{feature.icon}</span>
              <h3 className="mt-3 font-medium">{feature.title}</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{feature.description}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      <section className="bg-surface-muted px-4 py-20">
        <div className="mx-auto w-full max-w-4xl">
          <Reveal className="mb-12 text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          </Reveal>
          <StaggerGroup className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((item) => (
              <StaggerItem key={item.step}>
                <span className="text-gradient text-4xl font-bold">{item.step}</span>
                <h3 className="mt-3 font-medium">{item.title}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section className="px-4 py-24 text-center">
        <Reveal className="mx-auto flex max-w-md flex-col items-center gap-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to go live?</h2>
          <p className="text-zinc-500 dark:text-zinc-400">Create your account and publish your first site today.</p>
          <Link href={session ? "/dashboard" : "/register"} className="w-full sm:w-56">
            <Button>{session ? "Go to dashboard" : "Get started for free"}</Button>
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
