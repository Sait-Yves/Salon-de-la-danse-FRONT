"use client";

// Ouvre l'impression du navigateur (d'où l'on peut aussi enregistrer en PDF).
export default function PrintButton({ disabled, className = "btn-pill btn-pill-inverse shrink-0 text-sm" }: { disabled?: boolean; className?: string }) {
  return (
    <button type="button" disabled={disabled} onClick={() => window.print()} className={`${className} disabled:opacity-50`}>
      Imprimer / PDF
    </button>
  );
}
