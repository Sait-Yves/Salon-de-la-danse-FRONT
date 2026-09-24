"use client";

export default function PrintButton({ disabled }: { disabled?: boolean }) {
  return (
    <button type="button" disabled={disabled} onClick={() => window.print()} className="btn-pill btn-pill-inverse shrink-0 text-sm disabled:opacity-50">
      Imprimer / PDF
    </button>
  );
}
