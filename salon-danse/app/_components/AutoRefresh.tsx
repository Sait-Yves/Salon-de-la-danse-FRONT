"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Recharge les données de la page toutes les `seconds` secondes, sans perdre ce qui est en cours
// de saisie (router.refresh garde l'état des composants). En pause quand l'onglet est caché,
// et relance immédiate quand on revient sur l'onglet.
export default function AutoRefresh({ seconds = 30 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const id = setInterval(tick, seconds * 1000);
    const onVisible = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router, seconds]);
  return null;
}
