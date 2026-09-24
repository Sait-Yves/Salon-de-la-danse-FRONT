"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { PlacesPill, gaugeTone } from "../../_components/Gauge";
import { formatJour, SALON } from "../../services/config";
import { cancelReservationAction, reserveAction, validatePlanningAction } from "../../services/actions";
import type { Creneau, Reservation } from "../../services/types";

// Même logique que le back (ReservationService::assertSchedule), pour répondre tout de suite.
// Le back reste l'autorité : s'il refuse, son message est affiché.
function conflict(selected: Creneau[], c: Creneau): string | null {
  if (selected.length >= SALON.quotaMax) return "Maximum trois créneaux sur le week-end.";
  const sameDay = [...selected.filter((s) => s.jour === c.jour), c].sort((a, b) => a.debut.localeCompare(b.debut));
  let run = 1;
  for (let i = 1; i < sameDay.length; i++) {
    if (sameDay[i].debut < sameDay[i - 1].fin) return "Deux réservations ne peuvent pas se chevaucher.";
    run = sameDay[i].debut === sameDay[i - 1].fin ? run + 1 : 1;
    if (run >= 3) return "Trois créneaux consécutifs sont interdits : prévoyez une pause.";
  }
  return null;
}

export default function PlanningBoard({ creneaux, reservations, locked }: { creneaux: Creneau[]; reservations: Reservation[]; locked: boolean }) {
  const jours = useMemo(() => [...new Set(creneaux.map((c) => c.jour))].sort(), [creneaux]);
  const missions = useMemo(() => [...new Set(creneaux.map((c) => c.mission))].sort((a, b) => a.localeCompare(b)), [creneaux]);
  const [jour, setJour] = useState(jours[0]);
  const [mission, setMission] = useState("");
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState<number | "validate" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [, startTransition] = useTransition();

  // Les messages disparaissent seuls après 5 secondes.
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 5000);
    return () => clearTimeout(t);
  }, [msg]);

  const byCreneau = useMemo(() => new Map(reservations.map((r) => [r.creneau.id, r])), [reservations]);
  const selected = useMemo(
    () => reservations.map((r) => r.creneau).sort((a, b) => a.jour.localeCompare(b.jour) || a.debut.localeCompare(b.debut)),
    [reservations],
  );

  const groups = useMemo(() => {
    const list = creneaux.filter((c) => c.jour === jour && (!mission || c.mission === mission));
    const map = new Map<string, Creneau[]>();
    for (const c of list) {
      const k = `${c.debut}–${c.fin}`;
      map.set(k, [...(map.get(k) ?? []), c]);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [creneaux, jour, mission]);

  function run(id: number | "validate", fn: () => Promise<{ ok: boolean; message?: string }>, success?: string) {
    setBusy(id);
    setMsg(null);
    startTransition(async () => {
      const r = await fn();
      setBusy(null);
      const okText = success ?? r.message;
      setMsg(r.ok ? (okText ? { kind: "ok", text: okText } : null) : { kind: "error", text: r.message ?? "Une erreur est survenue." });
    });
  }

  function toggle(c: Creneau) {
    if (busy !== null) return;
    const mine = byCreneau.get(c.id);
    // Une demande en attente peut être annulée même après validation du planning.
    if (locked && mine?.validation === "en_attente") return run(c.id, () => cancelReservationAction(mine.id), "Demande annulée. Votre planning repasse en brouillon.");
    if (locked) return setMsg({ kind: "error", text: "Planning validé : seul un administrateur peut le modifier." });
    if (mine) return run(c.id, () => cancelReservationAction(mine.id));
    if (c.restantes === 0) return setMsg({ kind: "error", text: "Ce créneau est complet." });
    const why = conflict(selected, c);
    if (why) return setMsg({ kind: "error", text: why });
    run(c.id, () => reserveAction(c.id));
  }

  const count = selected.length;
  const enAttente = reservations.filter((r) => r.validation === "en_attente").length;

  return (
    <div className="mx-auto max-w-4xl p-4 pb-40 md:p-8 md:pb-40">
      <div className="banner-gradient mb-5 animate-rise">
        <h1 className="font-['Montserrat'] text-xl font-black md:text-2xl">Mon planning</h1>
        <p className="mt-1 text-sm text-white/75">
          {locked ? "Votre planning est validé et verrouillé." : `Choisissez de ${SALON.quotaMin} à ${SALON.quotaMax} créneaux. Vous pourrez modifier tant que vous n'avez pas validé.`}
        </p>
      </div>

      <div role="tablist" aria-label="Jours du Salon" className="mb-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${jours.length}, minmax(0, 1fr))` }}>
        {jours.map((j) => {
          const f = formatJour(j);
          const n = selected.filter((s) => s.jour === j).length;
          return (
            <button key={j} type="button" role="tab" aria-selected={jour === j} onClick={() => setJour(j)} className={`relative rounded-2xl border px-2 py-2.5 text-center font-['Montserrat'] transition ${jour === j ? "border-transparent bg-[image:var(--gradient-primary)] text-white shadow-md" : "border-[#7A291E]/15 bg-white text-[#7A291E] hover:border-[#7A291E]/40"}`}>
              <span className="block text-sm font-bold">{f.court}</span>
              <span className="block text-[11px] font-medium opacity-80">{f.num} {f.mois}</span>
              {n > 0 && <span className={`absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${jour === j ? "bg-white text-[#7A291E]" : "bg-[#7A291E] text-white"}`}>{n}</span>}
            </button>
          );
        })}
      </div>

      <div className="mb-4 flex items-center gap-3">
        <label htmlFor="mission" className="field-label !mb-0 whitespace-nowrap">Mission</label>
        <select id="mission" value={mission} onChange={(e) => setMission(e.target.value)} className="field !py-2">
          <option value="">Toutes les missions</option>
          {missions.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>


      <div className="space-y-6">
        {groups.length === 0 && <p className="rounded-2xl bg-[#7A291E]/5 p-6 text-center text-sm">Aucun créneau pour ce filtre.</p>}
        {groups.map(([horaire, list]) => (
          <section key={horaire} aria-label={`Créneau ${horaire}`}>
            <h2 className="mb-2 font-['Montserrat'] text-sm font-extrabold text-[#7A291E]">{horaire.replace("–", " – ")}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((c) => {
                const res = byCreneau.get(c.id);
                const mine = !!res;
                const attente = res?.validation === "en_attente";
                const full = c.restantes === 0;
                const blocked = !mine && !full && !locked && !!conflict(selected, c);
                const t = gaugeTone(c.restantes, c.capacite);
                const disabled = (full && !mine) || (locked && !mine) || (locked && mine && !attente);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggle(c)}
                    aria-pressed={mine}
                    aria-disabled={disabled || blocked}
                    disabled={busy === c.id}
                    className={`createur-card p-4 text-left ${mine ? "is-selected" : ""} ${disabled || blocked ? "opacity-55" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-['Montserrat'] text-sm font-bold text-[#333]">{c.mission}</p>
                        {c.sensible && <p className="mt-0.5 text-[11px] font-semibold text-[#7A291E]">Sur validation d&apos;un admin</p>}
                        <p className="text-xs">{c.debut} – {c.fin}</p>
                      </div>
                      <span className={`shrink-0 rounded-full border px-3 py-1 font-['Montserrat'] text-[11px] font-bold ${attente ? "border-[#A65A00] bg-[#FFF4E5] text-[#A65A00]" : mine ? "border-[#7A291E] bg-[#7A291E] text-white" : full ? "border-gray-300 text-gray-500" : blocked ? "border-gray-300 text-gray-500" : "border-[#7A291E]/30 text-[#7A291E]"}`}>
                        {busy === c.id ? "…" : attente ? "En attente" : res?.validation === "acceptee" ? "Accepté ✓" : mine ? (locked ? "Validé" : "Choisi ✓") : full ? "Complet" : blocked ? "Incompatible" : "Choisir"}
                      </span>
                    </div>
                    <div className="mt-3"><PlacesPill restantes={c.restantes} capacite={c.capacite} /></div>
                    <span className="sr-only">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {/* Message au-dessus de la barre du bas, visible même en bas de page */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-3 bottom-[5.5rem] z-40 mx-auto max-w-3xl">
        {msg && (
          <p role={msg.kind === "error" ? "alert" : "status"} className={`pointer-events-auto animate-fade-up rounded-2xl border px-4 py-3 text-sm font-semibold shadow-lg ${msg.kind === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}>{msg.text}</p>
        )}
      </div>

      {/* Barre fixe de validation */}
      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-3xl rounded-[26px] border border-[#7A291E]/10 bg-white/90 shadow-2xl shadow-[#3E150F]/25 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 p-3 md:px-8">
          <div className="min-w-0">
            <p className="font-['Montserrat'] text-sm font-extrabold text-[#333]">{count} / {SALON.quotaMax} créneau{count > 1 ? "x" : ""}</p>
            <p className="truncate text-xs">
              {count === 0 ? "Aucun créneau choisi" : selected.map((s) => `${formatJour(s.jour).court} ${s.debut}${byCreneau.get(s.id)?.validation === "en_attente" ? " (en attente)" : ""}`).join(" · ")}
            </p>
          </div>
          {locked ? (
            <Link href="/profile" className="btn-pill btn-pill-primary shrink-0 text-sm">Voir mon récap</Link>
          ) : (
            <button type="button" disabled={count < SALON.quotaMin || busy !== null} onClick={() => setConfirm(true)} className="btn-pill btn-pill-primary shrink-0 text-sm disabled:opacity-50">
              Valider mon planning
            </button>
          )}
        </div>
      </div>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <div className="animate-fade-up w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 id="confirm-title" className="font-['Montserrat'] text-lg font-extrabold text-[#333]">Valider définitivement ?</h2>
            <p className="mt-2 text-sm">Après validation, seul un administrateur pourra modifier votre planning ({count} créneau{count > 1 ? "x" : ""}).</p>
            {enAttente > 0 && <p className="mt-2 text-sm">{enAttente > 1 ? `${enAttente} demandes restent` : "1 demande reste"} en attente de validation par un administrateur. Vous pourrez l&apos;annuler tant qu&apos;elle n&apos;est pas acceptée.</p>}
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setConfirm(false)} className="btn-pill btn-pill-ghost text-sm">Annuler</button>
              <button
                type="button"
                onClick={() => { setConfirm(false); run("validate", validatePlanningAction, "Planning validé. Retrouvez-le dans votre profil."); }}
                className="btn-pill btn-pill-primary text-sm"
              >
                Valider définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
