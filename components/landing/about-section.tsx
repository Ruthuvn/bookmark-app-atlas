"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { LazyRender } from "@/components/ui/lazy-render";

// Animation skeleton placeholder
const AnimationSkeleton = () => (
  <div className="h-48 w-full animate-pulse bg-muted/30" />
);

// Dynamic imports for code splitting
const VaultDemo = dynamic(
  () => import("./demos/vault-demo").then((m) => m.VaultDemo),
  { ssr: false, loading: () => <AnimationSkeleton /> }
);

const CategoriesDemo = dynamic(
  () => import("./demos/about-categories-demo").then((m) => m.CategoriesDemo),
  { ssr: false, loading: () => <AnimationSkeleton /> }
);

const AboutAccessDemo = dynamic(
  () => import("./demos/about-access-demo").then((m) => m.AboutAccessDemo),
  { ssr: false, loading: () => <AnimationSkeleton /> }
);

const pillars = [
  {
    title: "Centralized",
    description: "All your links in one organized vault",
    Demo: VaultDemo,
  },
  {
    title: "Organized",
    description: "Custom categories to sort everything",
    Demo: CategoriesDemo,
  },
  {
    title: "Accessible",
    description: "Instant search finds anything fast",
    Demo: AboutAccessDemo,
  },
];

export function AboutSection() {
  return (
    <section id="about" className="bg-background py-28 md:py-40">
      <div className="mx-auto max-w-350 px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20 text-center"
        >
          <h2 className="text-4xl font-bold text-foreground md:text-5xl lg:text-6xl">
            Your Digital Vault
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-xl text-muted-foreground">
            Stop losing links. Start finding them instantly.
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-border bg-card"
            >
              <LazyRender minHeight={192} placeholder={<AnimationSkeleton />}>
                <pillar.Demo />
              </LazyRender>
              <div className="p-3 sm:p-6">
                <h3 className="mb-2 text-xl font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="text-muted-foreground">{pillar.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
