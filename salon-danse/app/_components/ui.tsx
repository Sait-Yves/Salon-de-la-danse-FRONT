"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({ children, pending: pendingLabel, className = "btn-pill btn-pill-primary w-full" }: { children: ReactNode; pending?: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending ? (pendingLabel ?? "Un instant…") : children}
    </button>
  );
}

export function Field({
  label, name, type = "text", error, ...rest
}: { label: string; name: string; type?: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="field-label">{label}</label>
      <input id={name} name={name} type={type} className="field" aria-invalid={!!error} aria-describedby={error ? `${name}-err` : undefined} {...rest} />
      {error && <p id={`${name}-err`} className="mt-1 text-xs font-semibold text-red-700">{error}</p>}
    </div>
  );
}

export function Alert({ kind = "error", children }: { kind?: "error" | "ok" | "warn"; children: ReactNode }) {
  const c = kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : kind === "warn" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-red-200 bg-red-50 text-red-700";
  return <p role={kind === "error" ? "alert" : "status"} className={`animate-fade-in rounded-xl border px-4 py-2.5 text-sm ${c}`}>{children}</p>;
}
