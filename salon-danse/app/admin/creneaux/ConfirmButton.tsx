"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "../../services/types";

// Bouton en deux clics : le premier arme, le second confirme. L'erreur éventuelle s'affiche dessous.
export default function ConfirmButton({
  label, confirm = "Confirmer ?", action, className = "", onDone,
}: {
  label: string;
  confirm?: string;
  action: () => Promise<ActionResult>;
  className?: string;
  onDone?: () => void;
}) {
  const [pending, start] = useTransition();
  const [armed, setArmed] = useState(false);
  const [error, setError] = useState("");

  function click() {
    if (!armed) { setArmed(true); setError(""); return; }
    start(async () => {
      const r = await action();
      setArmed(false);
      if (r.ok) onDone?.();
      else setError(r.message ?? "Une erreur est survenue.");
    });
  }

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        disabled={pending}
        onClick={click}
        onBlur={() => setArmed(false)}
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:opacity-60 ${armed ? "border-red-700 bg-red-700 text-white" : "border-[#7A291E]/25 text-[#7A291E] hover:border-[#7A291E]"} ${className}`}
      >
        {pending ? "…" : armed ? confirm : label}
      </button>
      {error && <span role="alert" className="absolute right-0 top-full z-10 mt-1 w-max max-w-64 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-right text-[11px] font-semibold text-red-700 shadow-sm">{error}</span>}
    </span>
  );
}
