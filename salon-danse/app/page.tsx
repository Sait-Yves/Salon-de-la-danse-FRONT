import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center hero-bg text-white p-5 sm:p-8 md:p-12 gap-6">
      <main className="animate-fade-up relative z-10 flex w-full max-w-[1080px] flex-col items-center justify-center space-y-5 sm:space-y-6 rounded-[28px] border border-white/15 bg-[#3E150F]/85 p-6 text-center shadow-2xl backdrop-blur-xl sm:p-10 md:p-12">
        {/* Tag de l'événement */}
        <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-6 py-2.5 font-['Montserrat'] text-xs font-bold text-white shadow-lg backdrop-blur sm:text-sm">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Salon de la Danse d&apos;Angers — 14 au 16 mai 2027
        </div>

        <h1 className="max-w-3xl text-balance font-['Montserrat'] text-3xl font-extrabold leading-[1.15] tracking-tight text-white drop-shadow-md sm:text-4xl md:text-[3.25rem]">
          L&apos;énergie de la danse au cœur de votre espace bénévole
        </h1>

        <p className="max-w-xl font-['Open_Sans'] text-base font-medium leading-relaxed text-white/80 md:text-lg">
          Plateforme officielle de l&apos;association JayDance Fam.
          Connectez-vous avec votre code d&apos;invitation unique pour rejoindre
          l&apos;aventure et composer votre planning.
        </p>

        <div className="flex w-full flex-col justify-center gap-4 pt-2 sm:flex-row">
          <Link href="/login" className="btn-pill btn-pill-inverse text-base">
            J&apos;ai mon code d&apos;invitation &rarr;
          </Link>
          <Link
            href="/dashboard"
            className="btn-pill btn-pill-primary text-base border border-white/25"
          >
            Aperçu Dashboard / Planning
          </Link>
        </div>
      </main>

      <footer className="relative z-10 text-center font-['Open_Sans'] text-xs font-semibold text-white/70 drop-shadow">
        Centre de Congrès d&apos;Angers — Plateforme Bénévoles
      </footer>
    </div>
  );
}
