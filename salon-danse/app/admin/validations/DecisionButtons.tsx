"use client";

import { useState, useTransition } from "react";
import { adminDecideAction } from "../../services/actions";
import ConfirmButton from "../creneaux/ConfirmButton";

// Accepter (1 clic) ou refuser (2 clics : la réservation est supprimée) une demande sensible.
export default function DecisionButtons({ reservationId }: { reservationId: number }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  return (
    <span className="relative inline-flex flex-wrap items-start justify-end gap-2">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => { const r = await adminDecideAction(reservationId, "acceptee"); setError(r.ok ? "" : r.message ?? "Erreur"); })}
        className="rounded-full border border-emerald-700 bg-emerald-700 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "…" : "Accepter"}
      </button>
      <ConfirmButton label="Refuser" confirm="Refuser ?" action={() => adminDecideAction(reservationId, "refusee")} />
      {error && <span role="alert" className="absolute right-0 top-full z-10 mt-1 w-max max-w-64 rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700">{error}</span>}
    </span>
  );
}
