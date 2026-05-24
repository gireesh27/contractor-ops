"use client";

import dynamic from "next/dynamic";

const ConstructionHero3D = dynamic(() => import("@/components/premium/ConstructionHero3D").then((mod) => mod.ConstructionHero3D), {
  ssr: false,
  loading: () => <div className="h-[360px] rounded-[2rem] border border-white/15 bg-white/10 shadow-glass backdrop-blur-xl" />
});

export function LandingHeroVisual() {
  return <ConstructionHero3D />;
}
