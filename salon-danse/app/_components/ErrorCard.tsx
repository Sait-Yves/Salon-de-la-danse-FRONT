import Link from "next/link";

export default function ErrorCard({ title = "Impossible d'afficher cette page", message, status }: { title?: string; message: string; status?: number }) {
  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
      <h2 className="font-['Montserrat'] text-lg font-extrabold text-red-800">{title}</h2>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      {status === 409 && <p className="mt-2 text-xs text-red-600">Le planning n&apos;est pas encore ouvert : aucune édition active côté serveur.</p>}
      {status === 401 && <Link href="/login" className="btn-pill btn-pill-primary mt-4 text-sm">Se reconnecter</Link>}
    </div>
  );
}
