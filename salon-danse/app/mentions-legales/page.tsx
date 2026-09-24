import Link from "next/link";

export const metadata = { title: "Mentions légales - Salon de la Danse" };

export default function MentionsLegales() {
  return (
    <div className="mx-auto w-full max-w-3xl flex-1 p-6 md:p-10">
      <Link href="/" className="text-sm font-semibold text-[#7A291E] underline">← Retour à l&apos;accueil</Link>
      <h1 className="mt-6 font-['Montserrat'] text-3xl font-extrabold">Mentions légales</h1>
      <p className="mt-4 text-sm">Contenu en cours de rédaction.</p>
    </div>
  );
}
