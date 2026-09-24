import { SALON } from "../services/config";
import type { User } from "../services/types";

// Badge bénévole 105 × 74 mm : nom de l'événement, photo, prénom, nom, rôle, ID unique, QR code.
export default function Badge({ user: u, qrSvg, photoSrc, id }: { user: User; qrSvg: string; photoSrc: string; id: string }) {
  return (
    <article className="badge relative flex h-[74mm] w-[105mm] flex-col overflow-hidden rounded-xl border border-[#7A291E]/15 bg-white shadow-sm">
      <header className="flex items-center justify-between gap-2 bg-[linear-gradient(135deg,#7A291E,#3E150F)] px-[4mm] py-[2mm] text-white">
        <span className="font-['Montserrat'] text-[3mm] font-black uppercase tracking-wide">{SALON.nom}</span>
        <span className="shrink-0 text-[2.4mm] text-white/80">{SALON.dates}</span>
      </header>
      <div className="flex flex-1 gap-[4mm] p-[4mm]">
        {u.hasPhoto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoSrc} alt="" className="h-[34mm] w-[27mm] shrink-0 rounded-[1.5mm] border border-[#7A291E]/20 object-cover" />
        ) : (
          <div className="flex h-[34mm] w-[27mm] shrink-0 items-center justify-center rounded-[1.5mm] bg-[#7A291E]/10 font-['Montserrat'] text-[8mm] font-black text-[#7A291E]">{u.prenom[0]}{u.nom[0]}</div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate font-['Montserrat'] text-[6mm] font-black leading-tight text-[#333]">{u.prenom}</p>
          <p className="truncate font-['Montserrat'] text-[4.2mm] font-bold uppercase leading-tight text-[#333]">{u.nom}</p>
          <div className="mt-[2mm] flex flex-wrap gap-[1.5mm]">
            <span className="rounded-full bg-[#7A291E] px-[3mm] py-[0.8mm] font-['Montserrat'] text-[3mm] font-black tracking-widest text-white">BÉNÉVOLE</span>
            {u.isMineur && <span className="rounded-full border border-[#A65A00] px-[2mm] py-[0.6mm] text-[2.6mm] font-bold text-[#A65A00]">MINEUR</span>}
          </div>
          <div className="mt-auto flex items-end justify-between gap-[2mm]">
            <span className="flex flex-col">
              <span className="text-[2.3mm] text-[#3E150F]/70">Missions et horaires : scannez</span>
              <span className="font-mono text-[2.8mm] font-semibold text-[#3E150F]">{id}</span>
            </span>
            <span className="h-[20mm] w-[20mm] shrink-0 [&>svg]:h-full [&>svg]:w-full" aria-label="QR code : missions et horaires à jour" dangerouslySetInnerHTML={{ __html: qrSvg }} />
          </div>
        </div>
      </div>
    </article>
  );
}
